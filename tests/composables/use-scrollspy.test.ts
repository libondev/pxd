import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useScrollspy } from '../../src/composables/use-scrollspy'
import { useSetupWrapper } from '../helpers/setup'

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

/**
 * happy-dom does not deliver a resize for synthetic changes, so `ResizeObserver`
 * is replaced with a mock whose recorded callback can be fired on demand.
 */
function installResizeObserverMock() {
  const instances: { callback: ResizeObserverCallback; targets: Set<Element> }[] = []

  vi.stubGlobal(
    'ResizeObserver',
    class MockResizeObserver {
      targets = new Set<Element>()
      callback: ResizeObserverCallback

      constructor(callback: ResizeObserverCallback) {
        this.callback = callback
        instances.push(this)
      }

      observe(el: Element) {
        this.targets.add(el)
      }

      unobserve(el: Element) {
        this.targets.delete(el)
      }

      disconnect() {
        this.targets.clear()
      }
    },
  )

  return {
    get count() {
      return instances.length
    },
    observed() {
      return Array.from(instances).flatMap(({ targets }) => Array.from(targets))
    },
    fireAll() {
      for (const { callback, targets } of instances) {
        if (!targets.size) {
          continue
        }

        callback(
          Array.from(targets).map((target) => ({ target }) as ResizeObserverEntry),
          {} as ResizeObserver,
        )
      }
    },
  }
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

  it('should stop measuring at the first target below the probe line', () => {
    const measure = vi.fn((top: number) => ({ top, bottom: top + 20 }))
    const targets = [0, 10, 500, 600, 700].map((top, index) => {
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

    // The probe line has to sit below the first two targets for the pass to
    // reach the third before it stops.
    const { update, unmount } = useSetupWrapper(() => useScrollspy(targets, { topOffset: 80 }))

    // The composable measures once on mount; only count the explicit pass.
    measure.mockClear()
    update()

    expect(measure).toHaveBeenCalledTimes(3)

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

    // Every target is above the probe line, so the scan cannot break early and
    // would measure the container for each one.
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

    // The window listener must have been released. If it had not, these window
    // metrics would pin the last target and the answer would become 3.
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
    // happy-dom never delivers a native resize, so the observer is replaced with
    // one whose callback can be fired by hand.
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
