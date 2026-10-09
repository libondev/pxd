import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { computed, onMounted, onScopeDispose, shallowRef, watch } from 'vue'
import {
  getScrollElement,
  getScrollListener,
  getScrollPosition,
  isViewportScroll,
} from '../utils/dom.js'
import { off, on, scheduleByRaf } from '../utils/event.js'
import { toValue } from '../utils/helper.js'
import { isServer } from '../utils/is.js'
import { useResizeObserver } from './use-resize-observer.js'

/** Slack for "the container sits at its maximum scroll offset". */
const BOTTOM_TOLERANCE = 2

export interface UseScrollspyOptions {
  /** Scrollable container. @default window */
  scrollTarget?: MaybeRefOrGetter<Window | HTMLElement | null>
  /** Pixels above the fold that count as passed; match a sticky header's height. @default 0 */
  topOffset?: MaybeRefOrGetter<number>
}

export interface UseScrollspyReturn {
  activeIndex: ShallowRef<number>
  activeEl: ShallowRef<HTMLElement | null>
  /** Recompute from the current layout, e.g. after a route switch or async content. */
  update: () => void
}

/** `targets` must be in document order: the probe line is bisected against their offsets. */
export function useScrollspy(
  targets: MaybeRefOrGetter<HTMLElement[]>,
  options: UseScrollspyOptions = {},
): UseScrollspyReturn {
  const { scrollTarget } = options
  const topOffset = computed(() => toValue(options.topOffset ?? 0))

  const activeIndex = shallowRef(-1)
  const activeEl = shallowRef<HTMLElement | null>(null)
  const targetItems = computed(() => toValue<HTMLElement[]>(targets))

  function setActive(items: HTMLElement[], index: number): void {
    activeIndex.value = index
    activeEl.value = index >= 0 ? items[index]! : null
  }

  /** -1 when no target is at or above the line. */
  function locateProbe(items: HTMLElement[], origin: number): number {
    const probe = topOffset.value
    let low = 0
    let high = items.length

    while (low < high) {
      const mid = (low + high) >> 1

      if (items[mid]!.getBoundingClientRect().top - origin > probe) {
        high = mid
      } else {
        low = mid + 1
      }
    }

    return low - 1
  }

  /** A short trailing section can never be scrolled up to the probe line. */
  function isExhausted(scrollTop: number, scrollHeight: number, clientHeight: number): boolean {
    return (
      scrollHeight - clientHeight > 1 && clientHeight + scrollTop >= scrollHeight - BOTTOM_TOLERANCE
    )
  }

  function update(): void {
    const items = targetItems.value

    if (!items.length) {
      setActive(items, -1)

      return
    }

    const metricsEl = getScrollElement(toValue(scrollTarget))
    const { scrollTop, scrollHeight, clientHeight } = getScrollPosition(metricsEl)

    if (isExhausted(scrollTop, scrollHeight, clientHeight)) {
      setActive(items, items.length - 1)

      return
    }

    // Resolved once per pass: measuring it per target would repeat the layout read.
    const origin = isViewportScroll(metricsEl) ? 0 : metricsEl.getBoundingClientRect().top

    setActive(items, Math.max(locateProbe(items, origin), 0))
  }

  if (!isServer()) {
    const scheduleUpdate = scheduleByRaf(update)

    let scrollListener: EventTarget | null = null
    let windowListener: Window | null = null

    function bindListeners(): void {
      const listener = getScrollListener(toValue(scrollTarget))

      if (listener === scrollListener) {
        return
      }

      off(scrollListener, 'scroll', scheduleUpdate)

      scrollListener = listener

      on(scrollListener, 'scroll', scheduleUpdate, { passive: true })

      // The root box tracks content, not the viewport, so the observer misses a window resize.
      const onWindow = listener === window ? window : null

      if (onWindow !== windowListener) {
        off(windowListener, 'resize', scheduleUpdate)

        windowListener = onWindow

        on(windowListener, 'resize', scheduleUpdate, { passive: true })
      }

      scheduleUpdate()
    }

    const stopListener = watch(() => toValue(scrollTarget), bindListeners, { flush: 'post' })

    const { stop: stopResizeObserver } = useResizeObserver(
      () => getScrollElement(toValue(scrollTarget)),
      scheduleUpdate,
    )

    const stopOffset = watch(topOffset, scheduleUpdate)
    const stopTargets = watch(() => targetItems.value, scheduleUpdate)

    onMounted(bindListeners)

    onScopeDispose(() => {
      scheduleUpdate.cancel()
      off(scrollListener, 'scroll', scheduleUpdate)
      off(windowListener, 'resize', scheduleUpdate)
      stopListener()
      stopResizeObserver()
      stopTargets()
      stopOffset()
    })
  }

  return {
    activeIndex,
    activeEl,
    update,
  }
}
