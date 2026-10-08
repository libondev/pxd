import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { computed, onScopeDispose, shallowRef, watch, watchPostEffect } from 'vue'
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
  /**
   * Pixel offset from the top of the viewport used to determine whether a
   * target has scrolled past the fold. Set this to match the height of any
   * sticky header / toolbar.
   * @default 0
   */
  topOffset?: MaybeRefOrGetter<number>
}

export interface UseScrollspyReturn {
  activeIndex: ShallowRef<number>
  activeEl: ShallowRef<HTMLElement | null>
  /**
   * Recompute the active target. Call this after layout-affecting changes
   * (route switches, async content loads) so the active state reflects the
   * latest DOM without waiting for a scroll event.
   */
  update: () => void
}

export function useScrollspy(
  targets: MaybeRefOrGetter<HTMLElement[]>,
  options: UseScrollspyOptions = {},
): UseScrollspyReturn {
  const { scrollTarget } = options
  const topOffset = computed(() => toValue(options.topOffset ?? 0))

  const activeIndex = shallowRef(-1)
  const activeEl = shallowRef<HTMLElement | null>(null)
  const targetItems = computed(() => toValue<HTMLElement[]>(targets))

  function update(): void {
    const items = targetItems.value
    const metricsEl = getScrollElement(toValue(scrollTarget))
    const { scrollTop, scrollHeight, clientHeight } = getScrollPosition(metricsEl)
    const offset = topOffset.value

    let idx = -1

    // Nothing is being read above the first target, and a container without a
    // scroll range has no last target to fall back on either.
    if (items.length > 0 && scrollTop > 0) {
      // A short trailing section can never be scrolled up to the probe line,
      // so the tail is pinned once the container is exhausted.
      if (
        scrollHeight - clientHeight > 1 &&
        clientHeight + scrollTop >= scrollHeight - BOTTOM_TOLERANCE
      ) {
        idx = items.length - 1
      } else {
        // The container origin is resolved once for the whole scan. Measuring it
        // per target would double the forced layout reads on the per-frame path,
        // which is the cost this pass exists to avoid.
        const origin = isViewportScroll(metricsEl) ? 0 : metricsEl.getBoundingClientRect().top

        for (let i = 0; i < items.length; i++) {
          // Targets are in document order, so the first one still below the
          // probe line ends the scan.
          if (items[i]!.getBoundingClientRect().top - origin > offset) {
            break
          }

          idx = i
        }
      }
    }

    activeIndex.value = idx
    activeEl.value = idx >= 0 ? items[idx]! : null
  }

  if (!isServer()) {
    // Scroll events are not frame aligned, and each pass measures every target.
    const scheduleUpdate = scheduleByRaf(update)

    let currentListener: EventTarget | null = null

    // A template ref is still null while setup runs, so the listener follows the
    // resolved element instead of binding once to whatever it happened to be.
    const stopListener = watchPostEffect(() => {
      const listener = getScrollListener(toValue(scrollTarget))

      if (listener === currentListener) {
        return
      }

      off(currentListener, 'scroll', scheduleUpdate)

      currentListener = listener

      on(listener, 'scroll', scheduleUpdate, { passive: true })
      // The container may only resolve after the first render, and the initial
      // state has to reflect wherever the page was restored to.
      scheduleUpdate()
    })

    const { stop: stopResizeObserver } = useResizeObserver(
      () => getScrollElement(toValue(scrollTarget)),
      scheduleUpdate,
    )

    // `targetItems` is a computed and hands back the same array unless the
    // source was replaced, so the copy is what makes the watch fire.
    const stopTargets = watch(() => targetItems.value.slice(), scheduleUpdate)
    const stopOffset = watch(topOffset, scheduleUpdate)

    onScopeDispose(() => {
      scheduleUpdate.cancel()
      off(currentListener, 'scroll', scheduleUpdate)
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
