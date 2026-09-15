import { onScopeDispose } from 'vue'

/**
 * Exponential backoff retry configuration.
 */
export interface BackoffRetryConfig {
  /** Maximum number of retries. @default 3 */
  maxRetries?: number
  /** Base delay in milliseconds. @default 500 */
  baseDelay?: number
  /** Maximum delay cap in milliseconds. @default 10000 */
  maxDelay?: number
  /** AbortSignal used to cancel in-flight work and backoff waits. */
  signal?: AbortSignal
  /**
   * Decide whether an error is worth retrying.
   * Return `true` to retry (e.g. 429, 5xx, network errors),
   * or `false` to rethrow immediately.
   *
   * Note: native `fetch` does not reject on 4xx/5xx. Callers must check
   * `response.ok` / status and throw for status-based rules to apply.
   */
  retryable?: (error: unknown) => boolean
  /** Called before each retry wait; useful for logging / metrics. */
  onRetry?: (attempt: number, delay: number, error: unknown) => void
}

const NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNABORTED',
  'EAI_AGAIN',
])

/**
 * Default retryable-error rules.
 */
export function isRetryableError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const err = error as Record<string, any>

  // Axios / fetch-style status errors (caller must throw)
  const status = err.status ?? err.statusCode ?? err.response?.status
  if (typeof status === 'number') {
    return status === 429 || status === 408 || (status >= 500 && status < 600)
  }

  // Walk the cause chain for network codes (guard against cycles)
  const seen = new WeakSet<object>()
  for (let e: any = err; e && typeof e === 'object'; e = e.cause) {
    if (seen.has(e)) {
      break
    }
    seen.add(e)

    if (typeof e.code === 'string' && NETWORK_ERROR_CODES.has(e.code)) {
      return true
    }
  }

  if (err.code === 'ERR_NETWORK' || err.code === 'ERR_BAD_RESPONSE') {
    return true
  }

  // Browser fetch network failures
  const msg = typeof err.message === 'string' ? err.message : ''
  if (
    err instanceof TypeError &&
    /failed to fetch|networkerror|network error|load failed/i.test(msg)
  ) {
    return true
  }

  return false
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'))
      return
    }

    const onAbort = () => {
      clearTimeout(timer)
      reject(signal!.reason ?? new DOMException('Aborted', 'AbortError'))
    }

    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)

    signal?.addEventListener('abort', onAbort)
  })
}

function attachAttempts(error: unknown, attempts: number): void {
  if (error instanceof Error) {
    ;(error as Error & { attempts: number }).attempts = attempts
    return
  }

  if (error !== null && typeof error === 'object') {
    ;(error as { attempts: number }).attempts = attempts
  }
}

async function withBackoffRetry<T>(
  fn: (signal: AbortSignal) => Promise<T>,
  config: BackoffRetryConfig = {},
): Promise<T> {
  const { baseDelay = 500, maxDelay = 10000, retryable = isRetryableError, onRetry } = config

  const maxRetries = Math.max(0, config.maxRetries ?? 3)
  const signal = config.signal ?? new AbortController().signal

  let lastError: unknown
  let attempts = 0

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    signal.throwIfAborted()

    try {
      return await fn(signal)
    } catch (error) {
      lastError = error
      attempts = attempt + 1

      if (attempt === maxRetries) {
        break
      }

      if (!retryable(error)) {
        throw error
      }

      const exponential = Math.min(baseDelay * 2 ** attempt, maxDelay)
      const delay = Math.round(Math.random() * exponential)

      try {
        onRetry?.(attempt + 1, delay, error)
      } catch {
        // Do not let logging / metrics callbacks break the retry loop
      }

      await sleep(delay, signal)
    }
  }

  attachAttempts(lastError, attempts)
  throw lastError
}

export interface UseBackoffRetryReturn {
  signal: AbortSignal
  abort: (reason?: any) => void
  retry: <T>(fn: (signal: AbortSignal) => Promise<T>, config?: BackoffRetryConfig) => Promise<T>
}

/**
 * Exponential backoff retry helper scoped to the current effect scope.
 *
 * - Exponential backoff with full jitter
 * - Maximum delay cap
 * - Customizable retryable-error predicate
 * - AbortSignal applies to both `fn(signal)` and backoff waits
 * - Auto-aborts on scope dispose; exhausted errors get an `attempts` property
 *
 * @example
 * const { retry } = useBackoffRetry({ maxRetries: 3, baseDelay: 500 })
 * await retry(async (signal) => {
 *   const res = await fetch('https://api.example.com', { signal })
 *   if (!res.ok) throw Object.assign(new Error(res.statusText), { status: res.status })
 *   return res.json()
 * })
 */
export function useBackoffRetry(defaultConfig: BackoffRetryConfig = {}): UseBackoffRetryReturn {
  const controller = new AbortController()

  onScopeDispose(() => {
    controller.abort()
  })

  function abort(reason?: any) {
    controller.abort(reason)
  }

  function retry<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    config: BackoffRetryConfig = {},
  ): Promise<T> {
    return withBackoffRetry(fn, {
      ...defaultConfig,
      ...config,
      signal: config.signal ?? defaultConfig.signal ?? controller.signal,
    })
  }

  return {
    retry,
    abort,
    signal: controller.signal,
  }
}
