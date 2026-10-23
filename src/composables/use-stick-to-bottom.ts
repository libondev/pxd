import type { Nullable } from '../types/shared/utils'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef, watch, onScopeDispose } from 'vue'
import { getElement } from '../utils/dom.js'
import { cachedOff, cachedOn, throttleByRaf } from '../utils/event.js'
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
 *
 * Only an upward scroll breaks follow. Every other scroll event is either
 * this composable's own stick or a browser adjustment (scroll anchoring,
 * focus scrolling), and re-measuring the live distance there would latch
 * `isAtBottom` off mid-stream — so it may only promote the state back on.
 */
export function useStickToBottom(
  container: MaybeRefOrGetter<Nullable<HTMLElement>>,
  content?: MaybeRefOrGetter<Nullable<HTMLElement>>,
  options: UseStickToBottomOptions = {},
): UseStickToBottomReturn {
  const { threshold = 16, enabled = true } = options

  const isAtBottom = shallowRef(true)

  let lastScrollTop = 0

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

    el.scrollTo({ top, behavior: 'instant' })
    lastScrollTop = top
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

  // 上移超过 threshold 才是用户离开：自身 stick 永远向下滚，而 scroll anchoring
  // 对视图上方重排的补偿、焦点滚动同样产生 scroll 事件，按实时距离绝对测量会把
  // 它们误判成用户滚走并锁死跟随（流式内容一边长高一边触发，恰好是最常见的路径）。
  function handleScroll() {
    const el = getContainerEl()

    if (!el) {
      return
    }

    const top = el.scrollTop
    const scrolledAway = top < lastScrollTop - getThreshold()

    lastScrollTop = top

    if (scrolledAway) {
      update()
      return
    }

    if (!isAtBottom.value && measureAtBottom(el)) {
      isAtBottom.value = true
    }
  }

  if (!isServer()) {
    const scheduleStick = throttleByRaf(stickIfNeeded)

    useResizeObserver(
      () => [getContentEl(), getContainerEl()],
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

    const stopWatch = watch(
      () => getContainerEl(),
      (el, oldEl) => {
        if (oldEl) {
          cachedOff(oldEl, 'scroll', handleScroll, { passive: true })
          scheduleStick.cancel()
        }

        if (!el) {
          return
        }

        lastScrollTop = el.scrollTop
        cachedOn(el, 'scroll', handleScroll, { passive: true })
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
      }

      scheduleStick.cancel()
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
