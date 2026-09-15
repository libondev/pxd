import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { useStickToBottom } from '../../src/composables/use-stick-to-bottom'
import { useSetupWrapper } from '../helpers/setup'

interface ScrollableMetrics {
  scrollHeight: number
  clientHeight: number
  scrollTop: number
}

function createScrollableContainer(initial: ScrollableMetrics) {
  const metrics: ScrollableMetrics = { ...initial }
  const container = document.createElement('div')

  Object.defineProperties(container, {
    scrollHeight: {
      configurable: true,
      get: () => metrics.scrollHeight,
    },
    clientHeight: {
      configurable: true,
      get: () => metrics.clientHeight,
    },
    scrollTop: {
      configurable: true,
      get: () => metrics.scrollTop,
      set: (value: number) => {
        metrics.scrollTop = value
      },
    },
  })

  const scrollTo = vi.fn((options?: ScrollToOptions | number) => {
    if (typeof options === 'number') {
      metrics.scrollTop = options
    } else if (typeof options?.top === 'number') {
      metrics.scrollTop = options.top
    }

    container.dispatchEvent(new Event('scroll'))
  })
  container.scrollTo = scrollTo as unknown as HTMLElement['scrollTo']

  document.body.appendChild(container)

  return {
    container,
    metrics,
    scrollTo,
    setContentHeight: (height: number) => {
      metrics.scrollHeight = height
    },
    userScrollTo: (top: number) => {
      metrics.scrollTop = top
      container.dispatchEvent(new Event('scroll'))
    },
    destroy: () => {
      container.remove()
    },
  }
}

async function flushRaf() {
  await new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve(undefined))
    } else {
      setTimeout(resolve, 16)
    }
  })
}

describe('useStickToBottom', () => {
  let cleanup: (() => void)[] = []

  beforeEach(() => {
    cleanup = []
  })

  afterEach(() => {
    cleanup.forEach((fn) => fn())
    cleanup = []
  })

  function setupScrollable(
    initial: ScrollableMetrics = { scrollHeight: 200, clientHeight: 100, scrollTop: 100 },
    options?: Parameters<typeof useStickToBottom>[2],
  ) {
    const helper = createScrollableContainer(initial)
    cleanup.push(helper.destroy)

    let result!: ReturnType<typeof useStickToBottom>
    const { unmount } = useSetupWrapper(() => {
      result = useStickToBottom(() => helper.container, undefined, options)
      return result
    })
    cleanup.push(unmount)

    return { ...helper, ...result }
  }

  it('starts at bottom', () => {
    const { isAtBottom } = setupScrollable()
    expect(isAtBottom.value).toBe(true)
  })

  it('scrolls to bottom when content grows while at bottom', async () => {
    const { metrics, scrollTo, setContentHeight, stickIfNeeded, isAtBottom } = setupScrollable({
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })

    setContentHeight(300)
    stickIfNeeded()
    await flushRaf()

    expect(isAtBottom.value).toBe(true)
    expect(scrollTo).toHaveBeenCalled()
    expect(metrics.scrollTop).toBe(200)
  })

  it('does not auto-scroll after user scrolls away from bottom', async () => {
    const { metrics, scrollTo, setContentHeight, userScrollTo, stickIfNeeded, isAtBottom } =
      setupScrollable({
        scrollHeight: 200,
        clientHeight: 100,
        scrollTop: 100,
      })

    userScrollTo(20)
    await flushRaf()
    expect(isAtBottom.value).toBe(false)

    setContentHeight(400)
    stickIfNeeded()
    await flushRaf()

    expect(metrics.scrollTop).toBe(20)
    expect(scrollTo).not.toHaveBeenCalled()
  })

  it('restores stick when user scrolls back to bottom', async () => {
    const { metrics, scrollTo, setContentHeight, userScrollTo, stickIfNeeded, isAtBottom } =
      setupScrollable({
        scrollHeight: 200,
        clientHeight: 100,
        scrollTop: 100,
      })

    userScrollTo(0)
    await flushRaf()
    expect(isAtBottom.value).toBe(false)

    userScrollTo(200 - 100)
    await flushRaf()
    expect(isAtBottom.value).toBe(true)

    setContentHeight(350)
    stickIfNeeded()
    await flushRaf()

    expect(scrollTo).toHaveBeenCalled()
    expect(metrics.scrollTop).toBe(250)
  })

  it('respects threshold when measuring bottom', async () => {
    const { isAtBottom, userScrollTo } = setupScrollable(
      {
        scrollHeight: 200,
        clientHeight: 100,
        scrollTop: 100,
      },
      { threshold: 16 },
    )

    userScrollTo(88)
    await flushRaf()

    expect(isAtBottom.value).toBe(true)
  })

  it('does not follow updates when disabled', async () => {
    const { metrics, scrollTo, setContentHeight, stickIfNeeded } = setupScrollable(
      {
        scrollHeight: 200,
        clientHeight: 100,
        scrollTop: 100,
      },
      { enabled: false },
    )

    setContentHeight(300)
    stickIfNeeded()
    await flushRaf()

    expect(scrollTo).not.toHaveBeenCalled()
    expect(metrics.scrollTop).toBe(100)
  })

  it('forceStickToBottom re-enables follow after user scroll', async () => {
    const {
      metrics,
      scrollTo,
      setContentHeight,
      userScrollTo,
      forceStickToBottom,
      stickIfNeeded,
      isAtBottom,
    } = setupScrollable({
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 100,
    })

    userScrollTo(0)
    await flushRaf()
    expect(isAtBottom.value).toBe(false)

    forceStickToBottom()
    expect(metrics.scrollTop).toBe(100)
    expect(isAtBottom.value).toBe(true)

    setContentHeight(280)
    stickIfNeeded()
    await flushRaf()
    expect(scrollTo).toHaveBeenCalled()
    expect(metrics.scrollTop).toBe(180)
  })

  it('scrollToBottom only controls vertical axis', () => {
    const { scrollTo, scrollToBottom } = setupScrollable({
      scrollHeight: 200,
      clientHeight: 100,
      scrollTop: 0,
    })

    scrollToBottom()

    expect(scrollTo).toHaveBeenCalledWith({ top: 100 })
    expect(scrollTo).not.toHaveBeenCalledWith(expect.objectContaining({ left: expect.anything() }))
  })

  it('treats non-overflowing container as at bottom', () => {
    const { isAtBottom } = setupScrollable({
      scrollHeight: 80,
      clientHeight: 100,
      scrollTop: 0,
    })

    expect(isAtBottom.value).toBe(true)
  })
})
