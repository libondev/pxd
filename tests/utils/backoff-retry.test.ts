import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { backoffRetry, isRetryableError } from '../../src/utils/backoff-retry'

class ToolError extends Error {}

describe('isRetryableError', () => {
  it('retries 429 / 408 / 5xx', () => {
    expect(isRetryableError({ status: 429 })).toBe(true)
    expect(isRetryableError({ statusCode: 408 })).toBe(true)
    expect(isRetryableError({ response: { status: 503 } })).toBe(true)
    expect(isRetryableError({ status: 400 })).toBe(false)
  })

  it('retries network codes along cause chain and breaks cycles', () => {
    const a: any = { code: 'ECONNRESET' }
    const b: any = { cause: a }
    a.cause = b

    expect(isRetryableError(b)).toBe(true)
    expect(isRetryableError({ code: 'ERR_NETWORK' })).toBe(true)
  })

  it('retries browser fetch TypeError network failures', () => {
    expect(isRetryableError(new TypeError('Failed to fetch'))).toBe(true)
    expect(isRetryableError(new TypeError('something else'))).toBe(false)
  })
})

describe('backoffRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('retries domain failures via custom retryable outside a component scope', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(new ToolError('tool failed'))
      .mockResolvedValueOnce('done')

    const promise = backoffRetry(fn, {
      maxRetries: 2,
      baseDelay: 50,
      maxDelay: 50,
      retryable: (error) => error instanceof ToolError,
    })

    await vi.runAllTimersAsync()
    await expect(promise).resolves.toBe('done')
    expect(fn).toHaveBeenCalledTimes(2)
  })

  it('rethrows immediately when retryable rejects the error', async () => {
    const error = new ToolError('permanent')
    const fn = vi.fn().mockRejectedValue(error)

    await expect(backoffRetry(fn, { retryable: () => false })).rejects.toBe(error)
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
