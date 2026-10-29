import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useBackoffRetry } from '../../src/composables/use-backoff-retry'
import { useSetupWrapper } from '../helpers/setup'

describe('useBackoffRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns on first success', async () => {
    const fn = vi.fn().mockResolvedValue('ok')
    const { retry, unmount } = useSetupWrapper(() => useBackoffRetry({ maxRetries: 3 }))

    await expect(retry(fn)).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('retries retryable errors then succeeds', async () => {
    const fn = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('rate limited'), { status: 429 }))
      .mockResolvedValueOnce('ok')

    const { retry, unmount } = useSetupWrapper(() =>
      useBackoffRetry({ maxRetries: 3, baseDelay: 100, maxDelay: 100 }),
    )

    const promise = retry(fn)
    await vi.runAllTimersAsync()

    await expect(promise).resolves.toBe('ok')
    expect(fn).toHaveBeenCalledTimes(2)
    unmount()
  })

  it('throws immediately for non-retryable errors', async () => {
    const error = Object.assign(new Error('bad request'), { status: 400 })
    const fn = vi.fn().mockRejectedValue(error)
    const { retry, unmount } = useSetupWrapper(() => useBackoffRetry({ maxRetries: 3 }))

    await expect(retry(fn)).rejects.toBe(error)
    expect(fn).toHaveBeenCalledTimes(1)
    unmount()
  })

  it('attaches attempts after exhausting retries', async () => {
    const error = Object.assign(new Error('server'), { status: 500 })
    const fn = vi.fn().mockRejectedValue(error)
    const { retry, unmount } = useSetupWrapper(() =>
      useBackoffRetry({ maxRetries: 2, baseDelay: 10, maxDelay: 10 }),
    )

    const promise = retry(fn).catch((error) => error)
    await vi.runAllTimersAsync()
    await expect(promise).resolves.toMatchObject({ attempts: 3 })
    expect(fn).toHaveBeenCalledTimes(3)
    unmount()
  })

  it('passes signal into fn and aborts during backoff wait', async () => {
    const controller = new AbortController()
    const fn = vi.fn().mockImplementation(async (signal: AbortSignal) => {
      expect(signal).toBe(controller.signal)
      throw Object.assign(new Error('server'), { status: 503 })
    })

    const onRetry = vi.fn()
    const { retry, unmount } = useSetupWrapper(() =>
      useBackoffRetry({
        signal: controller.signal,
        maxRetries: 5,
        baseDelay: 1000,
        maxDelay: 1000,
        onRetry,
      }),
    )

    const promise = retry(fn)

    await vi.advanceTimersByTimeAsync(0)
    expect(onRetry).toHaveBeenCalledTimes(1)

    controller.abort('stop')
    await expect(promise).rejects.toBe('stop')
    unmount()
  })

  it('uses the same rounded delay for onRetry and sleep', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.4)

    const fn = vi
      .fn()
      .mockRejectedValueOnce(Object.assign(new Error('server'), { status: 500 }))
      .mockResolvedValueOnce('ok')

    const onRetry = vi.fn()
    const { retry, unmount } = useSetupWrapper(() =>
      useBackoffRetry({
        maxRetries: 1,
        baseDelay: 1000,
        maxDelay: 1000,
        onRetry,
      }),
    )

    const promise = retry(fn)

    await vi.advanceTimersByTimeAsync(0)
    expect(onRetry).toHaveBeenCalledWith(1, 400, expect.any(Error))

    await vi.advanceTimersByTimeAsync(400)
    await expect(promise).resolves.toBe('ok')
    unmount()
  })

  it('aborts in-flight retry when scope is disposed', async () => {
    const { retry, signal, unmount } = useSetupWrapper(() =>
      useBackoffRetry({ maxRetries: 5, baseDelay: 1000 }),
    )

    const fn = vi.fn().mockRejectedValue(Object.assign(new Error('server'), { status: 503 }))
    const promise = retry(fn)

    await vi.advanceTimersByTimeAsync(0)
    expect(fn).toHaveBeenCalledTimes(1)

    unmount()
    expect(signal.aborted).toBe(true)
    await expect(promise).rejects.toBeTruthy()
  })
})
