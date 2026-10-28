import type { Nullable } from '../types/shared/utils'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef, watch, onScopeDispose } from 'vue'
import { getElement } from '../utils/dom.js'
import { caf, cachedOff, cachedOn, raf } from '../utils/event.js'
import { toValue } from '../utils/helper.js'
import { isServer } from '../utils/is.js'
import { useMutationObserver } from './use-mutation-observer.js'
import { useResizeObserver } from './use-resize-observer.js'

// Long enough to cover a collapse animation, short enough that the next streamed chunk still follows
const interactionQuietMs = 350

export interface UseStickToBottomOptions {
  threshold?: MaybeRefOrGetter<number>
  enabled?: MaybeRefOrGetter<boolean>
  /** Pointerdowns inside this element never count as interacting with the content. */
  interactExclude?: MaybeRefOrGetter<Nullable<HTMLElement>>
}

export interface UseStickToBottomReturn {
  isAtBottom: ShallowRef<boolean>
  scrollToBottom: () => void
  /** Scroll to bottom and re-enable follow. */
  forceStickToBottom: () => void
  stickIfNeeded: () => void
  update: () => void
}

/**
 * Keep a scroll container pinned to the bottom while content changes.
 *
 * Follow is a flag of its own, not `isAtBottom`: a container mounted over content that is already
 * taller than the viewport measures "not at bottom" before the first stick runs, and gating on that
 * measurement parked it at the top. Only an upward scroll the layout does not explain, and that
 * lands off the bottom, breaks follow — the composable's own writes, browser clamping and a
 * virtualizer correcting item sizes move the container the same way without meaning to leave.
 *
 * A resize the user caused — expanding a collapse, selecting text — owns the viewport until the
 * layout it started stops moving, so it can neither pull the view down nor be dragged by it.
 */
export function useStickToBottom(
  container: MaybeRefOrGetter<Nullable<HTMLElement>>,
  content?: MaybeRefOrGetter<Nullable<HTMLElement>>,
  options: UseStickToBottomOptions = {},
): UseStickToBottomReturn {
  const { threshold = 16, enabled = true, interactExclude = null } = options

  const isAtBottom = shallowRef(true)

  let following = true
  let lastScrollTop = 0
  let upwardDelta = 0
  let interactionAt = 0
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

    cancelJudge()
    const top = getBottomTop(el)

    // Smooth animation races the content growth it is meant to follow
    el.scrollTo({ top, behavior: 'instant' })
    lastScrollTop = el.scrollTop
    isAtBottom.value = true
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

    // A pending judgement owns the offset until it resolves: sticking now would undo a scroll the
    // user may be making, and the judge sticks for itself when the move turns out to be layout
    if (!toValue(enabled) || judgeFrame) {
      return
    }

    // A resize the user just caused (expanding a reasoning or tool-call panel) owns the viewport,
    // and the window keeps extending while the layout it started is still moving, so a collapse
    // animation cannot drag the view to the bottom either
    if (performance.now() - interactionAt < interactionQuietMs) {
      interactionAt = performance.now()

      // When that resize leaves the view off the bottom, the user has left: ending follow here is
      // what keeps the next measurement pass or streamed chunk from yanking the view back down
      if (!measureAtBottom(el)) {
        following = false
        update()
      }

      return
    }

    if (!following) {
      return
    }

    if (el.scrollTop !== getBottomTop(el)) {
      scrollToBottom()
    }

    settle()
  }

  // The height is produced by measurement passes that keep growing the content after the write, and
  // a later pass can land with nothing to observe it: no box changed, no node was added. So the
  // bottom is asserted across frames until the geometry stops moving.
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
      performance.now() - interactionAt < interactionQuietMs
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

    if (top !== getBottomTop(el)) {
      scrollToBottom()
    }

    settleTop = el.scrollTop
    settleHeight = el.scrollHeight

    // Bounded: three frames of rest, and a write that cannot land (a clamped or zoomed range) must
    // not spin forever
    if (settleCount > 0 && settleCount < 20) {
      settleFrame = raf(settleTick)
    }
  }

  function handlePointerdown(event: Event) {
    const exclude = getElement(toValue(interactExclude))
    const target = event.target

    if (target instanceof Element && exclude?.contains(target)) {
      return
    }

    interactionAt = performance.now()
  }

  function cancelJudge() {
    if (judgeFrame) {
      caf(judgeFrame)
      judgeFrame = 0
    }

    upwardDelta = 0
  }

  // A correction writes the offset before the layout that explains it lands, so an upward move can
  // only be told apart from the user's one frame later, once the height has caught up.
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

    // Being at the bottom again resumes follow, whatever moved the container there
    if (measureAtBottom(el)) {
      isAtBottom.value = true
      following = true
    }

    if (delta <= 0) {
      upwardDelta = 0
      return
    }

    if (!judgeFrame) {
      judgeHeight = el.scrollHeight
      judgeFrame = raf(decide)
    }

    upwardDelta += delta
  }

  if (!isServer()) {
    useResizeObserver(() => [getContentEl(), getContainerEl()], stickIfNeeded)

    useMutationObserver(() => getContainerEl(), stickIfNeeded, {
      childList: true,
      subtree: true,
      characterData: true,
      // A sibling hidden with a style toggle (a sticky action bar) changes the scroll range without
      // changing any box the resize observers watch
      attributes: true,
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
