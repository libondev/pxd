import type { CarouselMove } from '../../src/composables/use-carousel'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useCarousel } from '../../src/composables/use-carousel'
import { runWithScope } from '../helpers/setup'

describe('useCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should start at the default index and normalize it when looping', () => {
    const { result, stop } = runWithScope(() =>
      useCarousel({ count: 3, defaultIndex: 4, loop: true }),
    )

    expect(result.index.value).toBe(1)
    stop()
  })

  it('should clamp the default index when loop is off', () => {
    const { result, stop } = runWithScope(() =>
      useCarousel({ count: 3, defaultIndex: 4, loop: false }),
    )

    expect(result.index.value).toBe(2)
    stop()
  })

  it('should move next and prev within the bounds', async () => {
    const onChange = vi.fn()
    const { result, stop } = runWithScope(() => useCarousel({ count: 3, loop: false, onChange }))

    await expect(result.next()).resolves.toBe(1)
    expect(result.index.value).toBe(1)
    expect(result.isAtFirst.value).toBe(false)

    await expect(result.prev()).resolves.toBe(0)
    expect(result.index.value).toBe(0)
    expect(result.isAtFirst.value).toBe(true)
    expect(onChange).toHaveBeenNthCalledWith(1, 1, 'item-press')
    expect(onChange).toHaveBeenNthCalledWith(2, 0, 'item-press')

    stop()
  })

  it('should stop at the edges when loop is off', async () => {
    const onChange = vi.fn()
    const { result, stop } = runWithScope(() => useCarousel({ count: 2, loop: false, onChange }))

    await result.next()
    expect(result.isAtLast.value).toBe(true)

    await expect(result.next()).resolves.toBeNull()
    expect(result.index.value).toBe(1)
    expect(onChange).toHaveBeenCalledTimes(1)

    stop()
  })

  it('should wrap around and report the move when loop is on', async () => {
    const moves: CarouselMove[] = []
    const { result, stop } = runWithScope(() =>
      useCarousel({
        count: 3,
        defaultIndex: 2,
        loop: true,
        transition: (move) => {
          moves.push(move)
        },
      }),
    )

    await expect(result.next()).resolves.toBe(0)
    await expect(result.prev()).resolves.toBe(2)

    expect(moves).toEqual([
      { from: 2, to: 0, direction: 1, wrapped: true },
      { from: 0, to: 2, direction: -1, wrapped: true },
    ])

    stop()
  })

  it('should wait for the transition before committing the index', async () => {
    let resolveTransition!: () => void
    const transition = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          resolveTransition = resolve
        }),
    )
    const onChange = vi.fn()
    const { result, stop } = runWithScope(() =>
      useCarousel({ count: 3, loop: false, transition, onChange }),
    )

    const pending = result.next()
    expect(result.index.value).toBe(0)
    await Promise.resolve()
    expect(onChange).not.toHaveBeenCalled()

    resolveTransition()
    await expect(pending).resolves.toBe(1)
    expect(result.index.value).toBe(1)
    expect(onChange).toHaveBeenCalledWith(1, 'item-press')

    stop()
  })

  it('should jump to a target with goTo', async () => {
    const { result, stop } = runWithScope(() => useCarousel({ count: 3, loop: false }))

    await expect(result.goTo(2)).resolves.toBe(2)
    await expect(result.goTo(2)).resolves.toBe(2)
    await expect(result.goTo(9)).resolves.toBe(2)
    expect(result.index.value).toBe(2)

    stop()
  })

  it('should serialize rapid moves', async () => {
    const order: string[] = []
    const { result, stop } = runWithScope(() =>
      useCarousel({
        count: 3,
        loop: false,
        transition: async (move) => {
          order.push(`${move.from}->${move.to}`)
        },
      }),
    )

    const first = result.next()
    const second = result.next()

    await expect(first).resolves.toBe(1)
    await expect(second).resolves.toBe(2)
    expect(order).toEqual(['0->1', '1->2'])

    stop()
  })

  it('should advance on the interval while autoplay is on', async () => {
    const { result, stop } = runWithScope(() =>
      useCarousel({ count: 3, loop: true, autoplay: true, interval: 1000 }),
    )

    expect(result.progressKey.value).toBe(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(result.index.value).toBe(1)

    await vi.advanceTimersByTimeAsync(1000)
    expect(result.index.value).toBe(2)
    expect(result.progressKey.value).toBe(3)

    stop()
  })

  it('should pause and resume autoplay', async () => {
    const { result, stop } = runWithScope(() =>
      useCarousel({ count: 3, autoplay: true, interval: 1000 }),
    )

    result.pause()
    expect(result.isAutoPlayPaused.value).toBe(true)

    await vi.advanceTimersByTimeAsync(3000)
    expect(result.index.value).toBe(0)

    result.resume()
    expect(result.isAutoPlayPaused.value).toBe(false)

    await vi.advanceTimersByTimeAsync(1000)
    expect(result.index.value).toBe(1)

    stop()
  })

  it('should keep autoplay alive when there is nothing to move to', async () => {
    const { result, stop } = runWithScope(() =>
      useCarousel({ count: 1, autoplay: true, interval: 1000 }),
    )

    await vi.advanceTimersByTimeAsync(2000)
    expect(result.index.value).toBe(0)
    expect(result.progressKey.value).toBeGreaterThan(1)

    stop()
  })

  it('should clamp the index when the count shrinks', async () => {
    const count = ref(3)
    const { result, stop } = runWithScope(() =>
      useCarousel({ count, defaultIndex: 2, loop: false }),
    )

    count.value = 1
    await nextTick()

    expect(result.index.value).toBe(0)
    stop()
  })

  it('should stop the autoplay timer on stop', async () => {
    const { result, stop } = runWithScope(() =>
      useCarousel({ count: 3, autoplay: true, interval: 1000 }),
    )

    stop()
    await vi.advanceTimersByTimeAsync(5000)

    expect(result.index.value).toBe(0)
  })
})
