import { onScopeDispose } from 'vue'
import { backoffRetry, type BackoffRetryConfig } from '../utils/backoff-retry.js'

export interface UseBackoffRetryReturn {
  signal: AbortSignal
  abort: (reason?: any) => void
  retry: <T>(fn: (signal: AbortSignal) => Promise<T>, config?: BackoffRetryConfig) => Promise<T>
}

/**
 * Auto-aborts on scope dispose; exhausted errors get an `attempts` property.
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

  function abort(reason?: any) {
    controller.abort(reason)
  }

  function retry<T>(
    fn: (signal: AbortSignal) => Promise<T>,
    config: BackoffRetryConfig = {},
  ): Promise<T> {
    return backoffRetry(fn, {
      ...defaultConfig,
      ...config,
      signal: config.signal ?? defaultConfig.signal ?? controller.signal,
    })
  }

  onScopeDispose(() => {
    controller.abort()
  })

  return {
    retry,
    abort,
    signal: controller.signal,
  }
}
