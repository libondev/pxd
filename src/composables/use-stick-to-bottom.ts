import type { Nullable } from '../types/shared/utils'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef, watch, onScopeDispose } from 'vue'
import { getElement } from '../utils/dom.js'
import { caf, cachedOff, cachedOn, raf } from '../utils/event.js'
import { toValue } from '../utils/helper.js'
import { isServer } from '../utils/is.js'
import { useMutationObserver } from './use-mutation-observer.js'
import { useResizeObserver } from './use-resize-observer.js'

// Covers a collapse animation, short enough that streaming still follows
const interactionQuietMs = 350

export interface UseStickToBottomOptions {
  threshold?: MaybeRefOrGetter<number>
  enabled?: MaybeRefOrGetter<boolean>
  /** Sticky bar inside the container: pointerdowns there are ignored, and hiding it shifts the scroll range. */
  action?: MaybeRefOrGetter<Nullable<HTMLElement>>
}

export interface UseStickToBottomReturn {
  isAtBottom: ShallowRef<boolean>
  scrollToBottom: () => void
  forceStickToBottom: () => void
  stickIfNeeded: () => void
  update: () => void
}

/**
 * Follow is a flag of its own: a container mounted over content taller than the viewport measures
 * "not at bottom" before the first stick runs. Only an upward move the layout does not explain ends it.
 */
export function useStickToBottom(
  container: MaybeRefOrGetter<Nullable<HTMLElement>>,
  content?: MaybeRefOrGetter<Nullable<HTMLElement>>,
  options: UseStickToBottomOptions = {},
): UseStickToBottomReturn {
  const { threshold = 16, enabled = true, action = null } = options

  const isAtBottom = shallowRef(true)

  let following = true
  let lastScrollTop = 0
  let upwardDelta = 0
  let interactionUntil = 0
  let judgeFrame = 0
  let judgeHeight = 0
  let settleFrame = 0
  let settleCount = 0
  let settleHeight = -1
  let settleTop = -1

  function getContainerEl() {
    return getElement(toValue(container))
  }

  function getContentEl() {
    return getElement(toValue(content)) ?? getContainerEl()
  }

  function getActionEl() {
    return getElement(toValue(action))
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

  function writeBottom(el: HTMLElement, top: number) {
    cancelJudge()

    // Smooth races the content growth it follows
    el.scrollTo({ top, behavior: 'instant' })
    lastScrollTop = el.scrollTop
    isAtBottom.value = true
  }

  function scrollToBottom() {
    const el = getContainerEl()

    if (!el) {
      return
    }

    writeBottom(el, getBottomTop(el))
  }

  function forceStickToBottom() {
    following = true
    scrollToBottom()
  }

  function stickIfNeeded() {
    const el = getContainerEl()

    if (!el) {
      return
    }

    // A pending judgement owns the offset; it sticks for itself if the move turns out to be layout
    if (!toValue(enabled) || judgeFrame) {
      return
    }

    // The quiet window keeps a collapse animation from dragging the view
    if (performance.now() < interactionUntil) {
      // Off the bottom after that resize means the user left; the next chunk must not yank back down
      if (!measureAtBottom(el)) {
        following = false
        isAtBottom.value = false
      }

      return
    }

    if (!following) {
      return
    }

    const bottom = getBottomTop(el)

    if (el.scrollTop !== bottom) {
      writeBottom(el, bottom)
    }

    settle()
  }

  // A measurement pass can grow the content after the write with nothing left to observe it, so the
  // bottom is re-asserted until the geometry rests
  function settle() {
    if (settleFrame) {
      return
    }

    settleCount = 3
    settleHeight = -1
    settleTop = -1
    settleFrame = raf(settleTick)
  }

  function settleTick() {
    settleFrame = 0

    const el = getContainerEl()

    if (
      !el ||
      !following ||
      !toValue(enabled) ||
      judgeFrame ||
      performance.now() < interactionUntil
    ) {
      return
    }

    const height = el.scrollHeight
    const top = el.scrollTop

    if (top === settleTop && height === settleHeight) {
      settleCount -= 1
    } else {
      settleCount = 3
    }

    const bottom = getBottomTop(el)

    if (top !== bottom) {
      writeBottom(el, bottom)
    }

    settleTop = el.scrollTop
    settleHeight = el.scrollHeight

    // Bounded: three frames of rest
    if (settleCount > 0) {
      settleFrame = raf(settleTick)
    }
  }

  function handlePointerdown(event: Event) {
    const exclude = getActionEl()
    const target = event.target

    if (target instanceof Element && exclude?.contains(target)) {
      return
    }

    interactionUntil = performance.now() + interactionQuietMs
  }

  function cancelJudge() {
    if (judgeFrame) {
      caf(judgeFrame)
      judgeFrame = 0
    }

    upwardDelta = 0
  }

  // The offset is written before the layout that explains it lands, so an upward move is only
  // readable a frame later
  function decide() {
    judgeFrame = 0

    const el = getContainerEl()

    if (!el || !following) {
      upwardDelta = 0
      return
    }

    const travel = upwardDelta - Math.max(judgeHeight - el.scrollHeight, 0)

    if (travel <= 0) {
      upwardDelta = 0
      stickIfNeeded()

      return
    }

    if (travel <= getThreshold() || measureAtBottom(el)) {
      return
    }

    upwardDelta = 0
    following = false
    update()
  }

  function handleScroll() {
    const el = getContainerEl()

    if (!el) {
      return
    }

    const top = el.scrollTop
    const delta = lastScrollTop - top

    lastScrollTop = top

    if (delta > 0 && following) {
      upwardDelta += delta

      // A judge bails on its own once follow is off
      if (!judgeFrame) {
        judgeHeight = el.scrollHeight
        judgeFrame = raf(decide)
      }

      return
    }

    upwardDelta = 0

    // While following, this read would only force a layout of what a chunk just patched
    if (following) {
      return
    }

    // Back at the bottom resumes follow, whatever moved the container there
    if (measureAtBottom(el)) {
      isAtBottom.value = true
      following = true
    }
  }

  if (!isServer()) {
    useResizeObserver(() => [getContentEl(), getContainerEl()], stickIfNeeded)

    useMutationObserver(() => getContentEl(), stickIfNeeded, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    // Its style toggles move the scroll range without resizing an observed box. Watched alone, so
    // transcript churn stays out
    useMutationObserver(() => getActionEl(), stickIfNeeded, {
      attributes: true,
      subtree: true,
      attributeFilter: ['style', 'class', 'hidden'],
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

        lastScrollTop = el.scrollTop
        cachedOn(el, 'scroll', handleScroll, { passive: true })
        cachedOn(el, 'pointerdown', handlePointerdown)
        update()
        stickIfNeeded()
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

    onScopeDispose(() => {
      cancelJudge()

      if (settleFrame) {
        caf(settleFrame)
        settleFrame = 0
      }

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
