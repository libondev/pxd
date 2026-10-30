export interface BackoffRetryConfig {
  /** @default 3 */
  maxRetries?: number
  /** @default 500 */
  baseDelay?: number
  /** @default 10000 */
  maxDelay?: number
  signal?: AbortSignal
  /** Defaults to `isRetryableError`; native fetch does not reject on 4xx/5xx, so throw for status rules to apply. */
  retryable?: (error: unknown) => boolean
  onRetry?: (attempt: number, delay: number, error: unknown) => void
}

const NETWORK_ERROR_CODES = new Set([
  'ECONNRESET',
  'ETIMEDOUT',
  'ENOTFOUND',
  'ECONNABORTED',
  'EAI_AGAIN',
])

export function isRetryableError(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false
  }

  const err = error as Record<string, any>

  const status = err.status ?? err.statusCode ?? err.response?.status
  if (typeof status === 'number') {
    return status === 429 || status === 408 || (status >= 500 && status < 600)
  }

  // guard against cycles in the cause chain
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

  // browser fetch network failures
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

/** Vue-free (Node / Electron main safe); map any failure domain to a throw inside `fn` and decide via `retryable`. */
export async function backoffRetry<T>(
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
      } catch {}

      await sleep(delay, signal)
    }
  }

  attachAttempts(lastError, attempts)
  throw lastError
}
