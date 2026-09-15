# useBackoffRetry

Runs an async task with exponential backoff and full jitter. Cancels in-flight work and pending waits when the effect scope is disposed, or when you call `abort()`.

Native `fetch` does not reject on HTTP 4xx/5xx. Throw an error that carries a `status` (or use a custom `retryable`) if you want those responses to retry.

## Exports

```ts
function useBackoffRetry(defaultConfig?: BackoffRetryConfig): UseBackoffRetryReturn
function isRetryableError(error: unknown): boolean
```

## Types

```ts
interface BackoffRetryConfig {
  /** Maximum number of retries. @default 3 */
  maxRetries?: number
  /** Base delay in milliseconds. @default 500 */
  baseDelay?: number
  /** Maximum delay cap in milliseconds. @default 10000 */
  maxDelay?: number
  /** AbortSignal used to cancel in-flight work and backoff waits. */
  signal?: AbortSignal
  /**
   * Return `true` to retry, `false` to rethrow immediately.
   * Defaults to `isRetryableError`.
   */
  retryable?: (error: unknown) => boolean
  /** Called before each retry wait. */
  onRetry?: (attempt: number, delay: number, error: unknown) => void
}

interface UseBackoffRetryReturn {
  signal: AbortSignal
  abort: (reason?: any) => void
  retry: <T>(fn: (signal: AbortSignal) => Promise<T>, config?: BackoffRetryConfig) => Promise<T>
}
```

## Params

| Name | Type | Description |
| --- | --- | --- |
| `defaultConfig.maxRetries` | `number` | Maximum number of retries |
| `defaultConfig.baseDelay` | `number` | Base backoff delay in milliseconds |
| `defaultConfig.maxDelay` | `number` | Maximum backoff delay in milliseconds |
| `defaultConfig.signal` | `AbortSignal` | Optional external signal; otherwise a scope-owned controller is used |
| `defaultConfig.retryable` | `(error: unknown) => boolean` | Predicate for whether an error should be retried |
| `defaultConfig.onRetry` | `(attempt: number, delay: number, error: unknown) => void` | Hook invoked before each backoff wait |

## Returns

| Name | Type | Description |
| --- | --- | --- |
| `retry` | `(fn, config?) => Promise<T>` | Execute `fn` with backoff; `fn` receives the active `AbortSignal` |
| `abort` | `(reason?: any) => void` | Abort the scope-owned controller |
| `signal` | `AbortSignal` | The scope-owned abort signal |

Per-call `config` overrides `defaultConfig`. Exhausted errors that are objects get an `attempts` property with the total try count.

## Usage

```ts
import { useBackoffRetry } from 'pxd/composables'

const { retry, abort } = useBackoffRetry({
  maxRetries: 3,
  baseDelay: 500,
  onRetry: (attempt, delay, error) => {
    console.warn(`retry #${attempt}, wait ${delay}ms`, error)
  },
})

const data = await retry(async (signal) => {
  const res = await fetch('/api/data', { signal })
  if (!res.ok) {
    throw Object.assign(new Error(res.statusText), { status: res.status })
  }
  return res.json()
})
```

### Custom retryable rule

```ts
const { retry } = useBackoffRetry({
  retryable: (error) => (error as { status?: number })?.status === 429,
})
```

`isRetryableError` treats 429 / 408 / 5xx, common network codes (`ECONNRESET`, `ETIMEDOUT`, …), Axios `ERR_NETWORK` / `ERR_BAD_RESPONSE`, and browser `TypeError` fetch failures as retryable.
