import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useScrollspy } from '../../src/composables/use-scrollspy'
import { installResizeObserverMock, useSetupWrapper } from '../helpers/setup'

interface ScrollMetrics {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
}

/** happy-dom has no layout and no scroll range, so the metrics are written by hand. */
function stubScrollMetrics(el: Element, metrics: Partial<ScrollMetrics>) {
  for (const [key, value] of Object.entries(metrics)) {
    Object.defineProperty(el, key, { configurable: true, writable: true, value })
  }
}

/** Viewport-relative tops, i.e. what a window-scrolling spy reads. */
function createTargets(tops: number[]) {
  return tops.map((top, index) => {
    const el = document.createElement('h2')

    el.id = `heading-${index}`
    document.body.appendChild(el)

    setHeadingTop(el, top)

    return el
  })
}

function setHeadingTop(el: HTMLElement, top: number) {
  Object.defineProperty(el, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ top, bottom: top + 20, height: 20, left: 0, right: 0, width: 0 }),
  })
}

function useImmediateRaf() {
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    cb(0)
    return 0
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
}

describe('useScrollspy', () => {
  beforeEach(() => {
    useImmediateRaf()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.body.innerHTML = ''
    for (const key of ['scrollTop', 'scrollHeight', 'clientHeight']) {
      delete (document.documentElement as unknown as Record<string, unknown>)[key]
    }
  })

  it('should return expected API', () => {
    const { activeIndex, activeEl, update, unmount } = useSetupWrapper(() => useScrollspy([]))

    expect(activeIndex).toBeDefined()
    expect(activeEl).toBeDefined()
    expect(typeof update).toBe('function')
    unmount()
  })

  it('should default activeIndex to -1', () => {
    const { activeIndex, unmount } = useSetupWrapper(() => useScrollspy([]))

    expect(activeIndex.value).toBe(-1)
    unmount()
  })

  it('should default activeEl to null', () => {
    const { activeEl, unmount } = useSetupWrapper(() => useScrollspy([]))

    expect(activeEl.value).toBeNull()
    unmount()
  })

  it('should activate the last target above the probe line', () => {
    const targets = createTargets([-200, -50, 300, 900])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 250,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, activeEl, update, unmount } = useSetupWrapper(() => useScrollspy(targets))

    update()

    expect(activeIndex.value).toBe(1)
    expect(activeEl.value).toBe(targets[1])

    unmount()
  })

  it('should activate nothing above the first target', () => {
    const targets = createTargets([100, 300])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 1,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, update, unmount } = useSetupWrapper(() => useScrollspy(targets))

    update()

    expect(activeIndex.value).toBe(-1)

    unmount()
  })

  it('should activate nothing when there are no targets', () => {
    stubScrollMetrics(document.documentElement, {
      scrollTop: 500,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, activeEl, update, unmount } = useSetupWrapper(() => useScrollspy([]))

    update()

    expect(activeIndex.value).toBe(-1)
    expect(activeEl.value).toBeNull()

    unmount()
  })

  it('should pin the last target once the container is exhausted', () => {
    const targets = createTargets([0, 200, 400])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 1200,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, update, unmount } = useSetupWrapper(() => useScrollspy(targets))

    update()

    expect(activeIndex.value).toBe(2)

    unmount()
  })

  it('should not pin the last target when the container has no scroll range', () => {
    const targets = createTargets([100, 300])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 1,
      scrollHeight: 800,
      clientHeight: 800,
    })

    const { activeIndex, update, unmount } = useSetupWrapper(() => useScrollspy(targets))

    update()

    expect(activeIndex.value).toBe(-1)

    unmount()
  })

  it('should locate the probe line with a bisection, not one read per target', () => {
    const measure = vi.fn((top: number) => ({ top, bottom: top + 20 }))
    const tops = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 1000]
    const targets = tops.map((top, index) => {
      const el = document.createElement('h2')

      el.id = `heading-${index}`
      Object.defineProperty(el, 'getBoundingClientRect', {
        configurable: true,
        value: () => measure(top),
      })

      return el
    })

    stubScrollMetrics(document.documentElement, {
      scrollTop: 300,
      scrollHeight: 5000,
      clientHeight: 800,
    })

    // The probe line sits below every target but the last, so a full scan reads all of them.
    const { activeIndex, update, unmount } = useSetupWrapper(() =>
      useScrollspy(targets, { topOffset: 200 }),
    )

    // The composable measures once on mount; only count the explicit pass.
    measure.mockClear()
    update()

    expect(activeIndex.value).toBe(10)
    expect(measure.mock.calls.length).toBeLessThanOrEqual(Math.ceil(Math.log2(tops.length)) + 1)

    unmount()
  })

  it('should honour a reactive probe line', () => {
    const targets = createTargets([0, 60, 100])
    const topOffset = ref(80)

    stubScrollMetrics(document.documentElement, {
      scrollTop: 300,
      scrollHeight: 5000,
      clientHeight: 800,
    })

    const { activeIndex, update, unmount } = useSetupWrapper(() =>
      useScrollspy(targets, { topOffset }),
    )

    update()
    expect(activeIndex.value).toBe(1)

    topOffset.value = 40
    update()
    expect(activeIndex.value).toBe(0)

    unmount()
  })

  it('should read the scroll container once per pass, not once per target', () => {
    const container = document.createElement('div')

    document.body.appendChild(container)
    stubScrollMetrics(container, { scrollTop: 100, scrollHeight: 2000, clientHeight: 500 })

    const measureContainer = vi.fn(() => ({
      top: 0,
      bottom: 500,
      height: 500,
      left: 0,
      right: 0,
      width: 0,
    }))

    Object.defineProperty(container, 'getBoundingClientRect', {
      configurable: true,
      value: measureContainer,
    })

    // Every target is above the probe line, so a full scan measures the container for each.
    const targets = createTargets([-50, -40, -30, -20])

    const { activeIndex, update, unmount } = useSetupWrapper(() =>
      useScrollspy(targets, { scrollTarget: container, topOffset: 0 }),
    )

    measureContainer.mockClear()
    update()

    expect(activeIndex.value).toBe(3)
    expect(measureContainer).toHaveBeenCalledTimes(1)

    unmount()
  })

  it('should update from a scroll event', () => {
    const targets = createTargets([-200, -50, 300])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 250,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, unmount } = useSetupWrapper(() => useScrollspy(targets))

    window.dispatchEvent(new Event('scroll'))

    expect(activeIndex.value).toBe(1)

    unmount()
  })

  it('should update from a window resize', () => {
    const targets = createTargets([-200, 300])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 250,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, unmount } = useSetupWrapper(() => useScrollspy(targets))

    // The viewport shrank, so the second heading now sits above the probe line.
    setHeadingTop(targets[1]!, -50)
    window.dispatchEvent(new Event('resize'))

    expect(activeIndex.value).toBe(1)

    unmount()
  })

  it('should release the window resize listener on unmount', () => {
    const targets = createTargets([-200, 300])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 250,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, unmount } = useSetupWrapper(() => useScrollspy(targets))

    unmount()

    setHeadingTop(targets[1]!, -50)
    window.dispatchEvent(new Event('resize'))

    expect(activeIndex.value).toBe(0)
  })

  it('should rebind to a container that only resolves after mount', async () => {
    const container = document.createElement('div')

    document.body.appendChild(container)

    stubScrollMetrics(container, { scrollTop: 400, scrollHeight: 1200, clientHeight: 400 })
    Object.defineProperty(container, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 0, bottom: 400, height: 400, left: 0, right: 0, width: 0 }),
    })

    const targets = [-50, 0, 100, 200].map((top, index) => {
      const el = document.createElement('h2')

      el.id = `heading-${index}`
      Object.defineProperty(el, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({ top, bottom: top + 20, height: 20, left: 0, right: 0, width: 0 }),
      })

      return el
    })

    const scrollTarget = ref<HTMLElement | null>(null)

    const { activeIndex, unmount } = useSetupWrapper(() =>
      useScrollspy(targets, { scrollTarget, topOffset: 0 }),
    )

    scrollTarget.value = container
    await nextTick()

    container.dispatchEvent(new Event('scroll'))

    // Container-relative: 0 is the last heading at or above the probe line.
    expect(activeIndex.value).toBe(1)

    // A leaked window listener would pin the last target here, giving 3 instead of 1.
    stubScrollMetrics(document.documentElement, {
      scrollTop: 1200,
      scrollHeight: 2000,
      clientHeight: 800,
    })
    window.dispatchEvent(new Event('scroll'))

    expect(activeIndex.value).toBe(1)

    unmount()
  })

  it('should recompute when the target list is replaced', async () => {
    const before = createTargets([-200, 300])
    const after = createTargets([-200, -50])
    const targets = ref<HTMLElement[]>(before)

    stubScrollMetrics(document.documentElement, {
      scrollTop: 250,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, activeEl, unmount } = useSetupWrapper(() => useScrollspy(targets))

    expect(activeIndex.value).toBe(0)
    expect(activeEl.value).toBe(before[0])

    targets.value = after
    await nextTick()

    expect(activeIndex.value).toBe(1)
    expect(activeEl.value).toBe(after[1])

    unmount()
  })

  it('should recompute when the scroll container is resized', async () => {
    // happy-dom never delivers a native resize; the mock fires the callback by hand.
    const observers = installResizeObserverMock()

    const targets = createTargets([-200, 300])

    stubScrollMetrics(document.documentElement, {
      scrollTop: 250,
      scrollHeight: 2000,
      clientHeight: 800,
    })

    const { activeIndex, unmount } = useSetupWrapper(() => useScrollspy(targets))
    await nextTick()

    expect(observers.count).toBe(1)
    expect(observers.observed()).toEqual([document.documentElement])
    expect(activeIndex.value).toBe(0)

    // The content grew under the second heading, so it now sits above the line.
    setHeadingTop(targets[1]!, -50)
    observers.fireAll()
    await nextTick()

    expect(activeIndex.value).toBe(1)

    unmount()
  })
})
