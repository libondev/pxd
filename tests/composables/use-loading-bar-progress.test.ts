import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useLoadingBarProgress } from '../../src/composables/_internal/use-loading-bar-progress'
import { runWithScope } from '../helpers/setup'

describe('useLoadingBarProgress', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
        'performance',
        'Date',
      ],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should start at the minimum and trickle gradually', async () => {
    const { result, stop } = runWithScope(() =>
      useLoadingBarProgress({ minimum: 0.1, trickle: true }),
    )

    result.start()
    expect(result.status.value).toBe('running')
    expect(result.progress.value).toBe(0.1)

    await vi.advanceTimersByTimeAsync(400)

    expect(result.progress.value).toBeGreaterThan(0.1)
    expect(result.progress.value).toBeLessThan(0.5)

    stop()
  })

  it('should not jump to the cap when the frame timestamp crosses the trickle threshold', async () => {
    const { result, stop } = runWithScope(() => useLoadingBarProgress({ trickleThreshold: 100 }))

    result.start()
    await vi.advanceTimersByTimeAsync(300)

    expect(result.progress.value).toBeLessThan(0.5)
    stop()
  })

  it('should finish at the cap and hide after the delay', async () => {
    const { result, stop } = runWithScope(() => useLoadingBarProgress({ hideDelay: 200 }))

    result.start()
    result.finish()

    expect(result.status.value).toBe('finish')
    expect(result.progress.value).toBe(1)
    expect(result.hidden.value).toBe(false)

    await vi.advanceTimersByTimeAsync(200)
    expect(result.hidden.value).toBe(true)

    stop()
  })

  it('should error at the cap and hide after the delay', async () => {
    const { result, stop } = runWithScope(() => useLoadingBarProgress({ hideDelay: 100 }))

    result.start()
    result.error()

    expect(result.status.value).toBe('error')
    expect(result.progress.value).toBe(1)

    await vi.advanceTimersByTimeAsync(100)
    expect(result.hidden.value).toBe(true)

    stop()
  })

  it('should apply an explicit increase without trickling', () => {
    const { result, stop } = runWithScope(() => useLoadingBarProgress({ trickle: false }))

    result.start()
    const before = result.progress.value

    result.increase(0.2)

    expect(result.progress.value).toBeCloseTo(before + 0.2)
    stop()
  })

  it('should ignore finish before start', () => {
    const { result, stop } = runWithScope(() => useLoadingBarProgress())

    result.finish()

    expect(result.status.value).toBe('finish')
    expect(result.progress.value).toBe(0)
    stop()
  })

  it('should cancel the pending frame on stop', async () => {
    const { result, stop } = runWithScope(() => useLoadingBarProgress({ trickle: true }))

    result.start()
    stop()
    const progress = result.progress.value

    await vi.advanceTimersByTimeAsync(1000)

    expect(result.progress.value).toBe(progress)
  })
})
