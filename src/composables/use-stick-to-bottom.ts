import type { Nullable } from '../types/shared/utils'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef, watch, onScopeDispose } from 'vue'
import { getElement } from '../utils/dom.js'
import { cachedOff, cachedOn } from '../utils/event.js'
import { toValue } from '../utils/helper.js'
import { isServer } from '../utils/is.js'
import { useMutationObserver } from './use-mutation-observer.js'
import { useResizeObserver } from './use-resize-observer.js'

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
  /**
   * Suspend auto-stick from the next pointerdown on the content until a scroll or explicit stick.
   * @default false
   */
  pauseOnInteract?: MaybeRefOrGetter<boolean>
  /** Pointerdowns inside this element (e.g. a sticky input bar) never start the pause. */
  interactExclude?: MaybeRefOrGetter<Nullable<HTMLElement>>
}

export interface UseStickToBottomReturn {
  isAtBottom: ShallowRef<boolean>
  scrollToBottom: () => void
  /** Scroll to bottom and re-enable auto-stick. */
  forceStickToBottom: () => void
  /** Scroll to bottom only when currently at bottom and enabled; a pause re-measures instead. */
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
 *
 * Only an upward scroll breaks follow. Every other scroll event is either
 * this composable's own stick or a browser adjustment (scroll anchoring,
 * focus scrolling), and re-measuring the live distance there would latch
 * `isAtBottom` off mid-stream — so it may only promote the state back on.
 *
 * With `pauseOnInteract`, pointer interaction with the content suspends
 * auto-stick until the next scroll or explicit stick call.
 */
export function useStickToBottom(
  container: MaybeRefOrGetter<Nullable<HTMLElement>>,
  content?: MaybeRefOrGetter<Nullable<HTMLElement>>,
  options: UseStickToBottomOptions = {},
): UseStickToBottomReturn {
  const {
    threshold = 16,
    enabled = true,
    pauseOnInteract = false,
    interactExclude = null,
  } = options

  const isAtBottom = shallowRef(true)

  const lastScrollTop = shallowRef(0)

  let paused = false

  const upwardDelta = shallowRef(0)

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
    return el.scrollHeight - el.scrollTop - el.clientHeight <= getThreshold()
  }

  function getBottomTop(el: HTMLElement) {
    return Math.max(0, el.scrollHeight - el.clientHeight)
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

    paused = false
    const top = getBottomTop(el)

    el.scrollTo({ top, behavior: 'instant' })
    lastScrollTop.value = top
    isAtBottom.value = true
  }

  function forceStickToBottom() {
    isAtBottom.value = true
    scrollToBottom()
  }

  function stickIfNeeded() {
    if (paused) {
      update()
      return
    }

    if (!toValue(enabled) || !isAtBottom.value) {
      return
    }

    const el = getContainerEl()

    if (el && el.scrollTop !== getBottomTop(el)) {
      scrollToBottom()
    }
  }

  function handlePointerdown(event: Event) {
    if (!toValue(pauseOnInteract) || paused) {
      return
    }

    const exclude = getElement(toValue(interactExclude))
    const target = event.target

    if (target instanceof Element && exclude?.contains(target)) {
      return
    }

    paused = true
  }

  function handleScroll() {
    const el = getContainerEl()

    if (!el) {
      return
    }

    paused = false

    const top = el.scrollTop
    const delta = lastScrollTop.value - top

    lastScrollTop.value = top

    if (delta <= 0) {
      upwardDelta.value = 0
    } else {
      upwardDelta.value += delta
    }

    if (upwardDelta.value > getThreshold()) {
      upwardDelta.value = 0
      update()
      return
    }

    if (!isAtBottom.value && measureAtBottom(el)) {
      isAtBottom.value = true
    }
  }

  if (!isServer()) {
    useResizeObserver(() => [getContentEl(), getContainerEl()], stickIfNeeded)

    useMutationObserver(() => getContainerEl(), stickIfNeeded, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    const stopWatch = watch(
      () => getContainerEl(),
      (el, oldEl) => {
        if (oldEl) {
          cachedOff(oldEl, 'scroll', handleScroll, { passive: true })
          cachedOff(oldEl, 'pointerdown', handlePointerdown)
        }

        if (!el) {
          return
        }

        lastScrollTop.value = el.scrollTop
        cachedOn(el, 'scroll', handleScroll, { passive: true })
        cachedOn(el, 'pointerdown', handlePointerdown)
        update()
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

    onScopeDispose(() => {
      const el = getContainerEl()

      if (el) {
        cachedOff(el, 'scroll', handleScroll, { passive: true })
        cachedOff(el, 'pointerdown', handlePointerdown)
      }

      stopWatch()
    })
  }

  return {
    isAtBottom,
    scrollToBottom,
    forceStickToBottom,
    stickIfNeeded,
    update,
  }
}
