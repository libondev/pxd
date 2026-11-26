import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { awaitAnimationEnd, getScrollPosition } from '../../src/utils/dom'

interface FakeAnimation {
  endTime?: number
  currentTime?: number | null
  finished?: Promise<void>
}

function fakeElement(animations: FakeAnimation[]): Element {
  return {
    getAnimations: () =>
      animations.map(({ endTime = 150, currentTime = 0, finished = Promise.resolve() }) => ({
        currentTime,
        effect: { getComputedTiming: () => ({ endTime }) },
        finished,
      })),
  } as unknown as Element
}

function neverSettles() {
  return new Promise<void>(() => {})
}

describe('awaitAnimationEnd', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('should resolve at once when the element animates nothing', async () => {
    await expect(awaitAnimationEnd(fakeElement([]))).resolves.toBeUndefined()
    await expect(awaitAnimationEnd()).resolves.toBeUndefined()
    await expect(awaitAnimationEnd({} as Element)).resolves.toBeUndefined()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('should wait for the running animation', async () => {
    let finish!: () => void
    const finished = new Promise<void>((resolve) => {
      finish = resolve
    })
    const pending = awaitAnimationEnd(fakeElement([{ finished }]))
    let done = false

    void pending.then(() => {
      done = true
    })

    await Promise.resolve()
    expect(done).toBe(false)

    finish()
    await pending
    expect(done).toBe(true)
    // The grace timer must not outlive the animation.
    expect(vi.getTimerCount()).toBe(0)
  })

  it('should give up when the animation never settles', async () => {
    const pending = awaitAnimationEnd(fakeElement([{ endTime: 150, finished: neverSettles() }]))
    let done = false

    void pending.then(() => {
      done = true
    })

    await vi.advanceTimersByTimeAsync(1149)
    expect(done).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await pending
    expect(done).toBe(true)
  })

  it('should count only the time the animation has left', async () => {
    const pending = awaitAnimationEnd(
      fakeElement([{ endTime: 1000, currentTime: 900, finished: neverSettles() }]),
    )
    let done = false

    void pending.then(() => {
      done = true
    })

    await vi.advanceTimersByTimeAsync(1099)
    expect(done).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await pending
    expect(done).toBe(true)
  })

  it('should not wait on an animation that cannot end', async () => {
    const pending = awaitAnimationEnd(
      fakeElement([{ endTime: Infinity, finished: neverSettles() }]),
    )

    await expect(pending).resolves.toBeUndefined()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('should treat an unknown current time as the start of the animation', async () => {
    const pending = awaitAnimationEnd(
      fakeElement([{ endTime: 150, currentTime: null, finished: neverSettles() }]),
    )
    let done = false

    void pending.then(() => {
      done = true
    })

    await vi.advanceTimersByTimeAsync(1149)
    expect(done).toBe(false)

    await vi.advanceTimersByTimeAsync(1)
    await pending
    expect(done).toBe(true)
  })
})

describe('getScrollPosition', () => {
  it('should never report a non-finite metric', () => {
    const el = document.createElement('div')

    Object.defineProperties(el, {
      scrollTop: { configurable: true, get: () => Number.NaN },
      scrollHeight: { configurable: true, get: () => undefined },
      clientHeight: { configurable: true, get: () => Number.POSITIVE_INFINITY },
    })

    expect(getScrollPosition(el)).toEqual({
      scrollTop: 0,
      scrollLeft: 0,
      scrollWidth: 0,
      scrollHeight: 0,
      clientWidth: 0,
      clientHeight: 0,
    })
  })

  it('should keep the metrics of a measurable element', () => {
    const el = document.createElement('div')

    Object.defineProperties(el, {
      scrollTop: { configurable: true, get: () => 40 },
      scrollHeight: { configurable: true, get: () => 300 },
      clientHeight: { configurable: true, get: () => 100 },
    })

    expect(getScrollPosition(el)).toMatchObject({
      scrollTop: 40,
      scrollHeight: 300,
      clientHeight: 100,
    })
  })
})
