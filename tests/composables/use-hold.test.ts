import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useHold } from '../../src/composables/use-hold'
import { runWithScope } from '../helpers/setup'

describe('useHold', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should confirm once the hold reaches the duration', async () => {
    const onConfirm = vi.fn()
    const { result, stop } = runWithScope(() => useHold({ duration: 100, onConfirm }))

    result.start()
    expect(result.status.value).toBe('loading')

    await vi.advanceTimersByTimeAsync(200)

    expect(result.status.value).toBe('confirmed')
    expect(result.progress.value).toBe(1)
    expect(onConfirm).toHaveBeenCalledTimes(1)

    stop()
  })

  it('should stop accumulating time while paused', async () => {
    const { result, stop } = runWithScope(() => useHold({ duration: 100 }))

    result.start()
    await vi.advanceTimersByTimeAsync(50)
    result.pause()
    expect(result.status.value).toBe('canceled')

    const pausedProgress = result.progress.value
    await vi.advanceTimersByTimeAsync(500)
    expect(result.progress.value).toBe(pausedProgress)

    result.resume()
    expect(result.status.value).toBe('loading')
    await vi.advanceTimersByTimeAsync(200)
    expect(result.status.value).toBe('confirmed')

    stop()
  })

  it('should report the progress of a cancelled hold and reset', () => {
    const onCancel = vi.fn()
    const { result, stop } = runWithScope(() => useHold({ duration: 100, onCancel }))

    result.start()
    result.stop()

    expect(result.status.value).toBe('idle')
    expect(result.progress.value).toBe(0)
    expect(onCancel).toHaveBeenCalledWith(0)

    stop()
  })

  it('should not start while disabled', () => {
    const { result, stop } = runWithScope(() => useHold({ enabled: false }))

    result.start()

    expect(result.status.value).toBe('idle')
    stop()
  })

  it('should ignore stop when idle', () => {
    const onCancel = vi.fn()
    const { result, stop } = runWithScope(() => useHold({ onCancel }))

    result.stop()

    expect(onCancel).not.toHaveBeenCalled()
    stop()
  })

  it('should cancel the pending frame on scope dispose', async () => {
    const onConfirm = vi.fn()
    const { result, stop } = runWithScope(() => useHold({ duration: 100, onConfirm }))

    result.start()
    stop()
    await vi.advanceTimersByTimeAsync(500)

    expect(onConfirm).not.toHaveBeenCalled()
    expect(result.status.value).toBe('loading')
  })
})
