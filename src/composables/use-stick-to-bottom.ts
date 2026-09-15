import type { Nullable } from '../types/shared/utils'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef, watch, onScopeDispose } from 'vue'
import { getElement } from '../utils/dom.js'
import { cachedOff, cachedOn, throttleByRaf } from '../utils/event.js'
import { toValue } from '../utils/helper.js'
import { isServer } from '../utils/is.js'
import { useMutationObserver, useResizeObserver } from './use-browser-observer.js'

export interface UseStickToBottomOptions {
  /**
   * Pixel distance from the bottom considered "at bottom".
   * @default 16
   */
  threshold?: MaybeRefOrGetter<number>
  /**
   * Whether content updates should auto-scroll while at bottom.
   * @default true
   */
  enabled?: MaybeRefOrGetter<boolean>
}

export interface UseStickToBottomReturn {
  isAtBottom: ShallowRef<boolean>
  scrollToBottom: () => void
  /** Scroll to bottom and re-enable auto-stick. */
  forceStickToBottom: () => void
  /** Scroll to bottom only when currently at bottom and enabled. */
  stickIfNeeded: () => void
  /** Re-measure whether the container is at the bottom. */
  update: () => void
}

/**
 * Keep a scroll container pinned to the bottom while content changes,
 * until the user scrolls away. Returning to the bottom re-enables follow.
 *
 * Auto-scroll is always instant to avoid smooth-animation races that
 * break continuous follow in chat-style lists.
 */
export function useStickToBottom(
  container: MaybeRefOrGetter<Nullable<HTMLElement>>,
  content?: MaybeRefOrGetter<Nullable<HTMLElement>>,
  options: UseStickToBottomOptions = {},
): UseStickToBottomReturn {
  const { threshold = 16, enabled = true } = options

  const isAtBottom = shallowRef(true)

  function getContainerEl() {
    return getElement(toValue(container))
  }

  function getContentEl() {
    return getElement(toValue(content)) ?? getContainerEl()
  }

  function getThreshold() {
    return toValue(threshold)
  }

  function measureAtBottom(el: HTMLElement) {
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    return distanceToBottom <= getThreshold()
  }

  function update() {
    const el = getContainerEl()

    if (!el) {
      return
    }

    isAtBottom.value = measureAtBottom(el)
  }

  function scrollToBottom() {
    const el = getContainerEl()

    if (!el) {
      return
    }

    const top = Math.max(0, el.scrollHeight - el.clientHeight)
    // Only control the vertical axis so horizontal scroll stays intact.
    el.scrollTo({ top })
    isAtBottom.value = true
  }

  function forceStickToBottom() {
    isAtBottom.value = true
    scrollToBottom()
  }

  function stickIfNeeded() {
    if (!toValue(enabled) || !isAtBottom.value) {
      return
    }

    scrollToBottom()
  }

  const scheduleUpdate = throttleByRaf(update)
  const scheduleStick = throttleByRaf(stickIfNeeded)

  useResizeObserver(
    () => getContentEl(),
    () => {
      scheduleStick()
    },
  )

  useResizeObserver(
    () => getContainerEl(),
    () => {
      scheduleStick()
    },
  )

  useMutationObserver(
    () => getContainerEl(),
    () => {
      scheduleStick()
    },
    {
      childList: true,
      subtree: true,
      characterData: true,
    },
  )

  watch(
    () => getContainerEl(),
    (el, oldEl) => {
      if (oldEl && !isServer()) {
        cachedOff(oldEl, 'scroll', scheduleUpdate, { passive: true })
        scheduleUpdate.cancel()
        scheduleStick.cancel()
      }

      if (isServer() || !el) {
        return
      }

      cachedOn(el, 'scroll', scheduleUpdate, { passive: true })
      update()
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  onScopeDispose(() => {
    const el = getContainerEl()

    if (el && !isServer()) {
      cachedOff(el, 'scroll', scheduleUpdate, { passive: true })
    }

    scheduleUpdate.cancel()
    scheduleStick.cancel()
  })

  return {
    isAtBottom,
    scrollToBottom,
    forceStickToBottom,
    stickIfNeeded,
    update,
  }
}
