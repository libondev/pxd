import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef, onScopeDispose, computed } from 'vue'
import {
  getElementOffsetFromScrollContainer,
  getScrollElement,
  getScrollListener,
  getScrollPosition,
} from '../utils/dom'
import { on, off } from '../utils/event'
import { toValue } from '../utils/helper'
import { isServer } from '../utils/is'

export interface UseScrollspyOptions {
  /** Scrollable container. @default window */
  scrollTarget?: MaybeRefOrGetter<Window | HTMLElement | null>
  /**
   * Pixel offset from the top of the viewport used to determine whether a
   * target has scrolled past the fold. Set this to match the height of any
   * sticky header / toolbar.
   * @default 80
   */
  topOffset?: number
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
  const { scrollTarget, topOffset = 80 } = options

  const activeIndex = shallowRef(-1)
  const activeEl = shallowRef<HTMLElement | null>(null)
  const targetItems = computed(() => toValue<HTMLElement[]>(targets))

  function getMetricsElement(): HTMLElement {
    return getScrollElement(toValue(scrollTarget))
  }

  function update(): void {
    const metricsEl = getMetricsElement()
    const { scrollTop, scrollHeight, clientHeight } = getScrollPosition(metricsEl)

    // At the very top: nothing should be highlighted
    if (scrollTop <= 0) {
      activeIndex.value = -1
      activeEl.value = null
      return
    }

    if (targetItems.value.length === 0) {
      activeIndex.value = -1
      activeEl.value = null
      return
    }

    // At the very bottom: always highlight the last target
    if (clientHeight + scrollTop >= scrollHeight - 1) {
      const lastIdx = targetItems.value.length - 1
      activeIndex.value = lastIdx
      activeEl.value = targetItems.value[lastIdx]!
      return
    }

    // Find the last target that has scrolled past the top offset
    let idx = -1
    for (let i = 0; i < targetItems.value.length; i++) {
      const relativePosition = getElementOffsetFromScrollContainer(targetItems.value[i]!, metricsEl)
      if (relativePosition.top <= topOffset) {
        idx = i
      }
    }

    activeIndex.value = idx
    activeEl.value = idx >= 0 ? targetItems.value[idx]! : null
  }

  if (!isServer()) {
    const listener = getScrollListener(toValue(scrollTarget))
    on(listener, 'scroll', update, { passive: true })

    onScopeDispose(() => {
      off(listener, 'scroll', update)
    })
  }

  return {
    activeIndex,
    activeEl,
    update,
  }
}
