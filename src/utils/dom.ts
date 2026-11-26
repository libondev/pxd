import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import { toValue } from 'vue'
import { isServer } from './is.js'

function getWindowTop() {
  return [window, document, document.documentElement]
}

type ElementType = null | string | object | SVGElement | HTMLElement | ComponentPublicInstance

export function getStyle(el: HTMLElement): CSSStyleDeclaration {
  if (isServer() || !el) {
    return {} as CSSStyleDeclaration
  }

  return document.defaultView?.getComputedStyle(el, null) || el.style
}

export function getElement(
  el?: MaybeRefOrGetter<ElementType>,
  from?: MaybeRefOrGetter<HTMLElement>,
): HTMLElement | null {
  if (isServer()) {
    return null
  }

  el = toValue(el)

  if (!el) {
    return null
  }

  if (typeof el === 'string') {
    return (toValue(from) || document).querySelector(el)
  }

  if (el instanceof Element) {
    return el as HTMLElement
  }

  const node = (el as ComponentPublicInstance)?.$el
  return node instanceof HTMLElement ? node : null
}

/** Whether the element scrolls with the viewport instead of scrolling on its own. */
export function isViewportScroll(el: HTMLElement) {
  return getWindowTop().includes(el) || el === document.body
}

/** Whether the element is allowed to scroll on each axis by its computed `overflow`. */
export function isScrollable(el: HTMLElement) {
  const { overflowX, overflowY } = getStyle(el)

  const allowValues = ['scroll', 'auto', 'overlay']

  // when the width and height of the content are greater than those of the html,
  // the html element is scrollable even without actively setting an overflow
  if (el.tagName === 'HTML') {
    allowValues.push('visible')
  }

  return {
    x: allowValues.includes(overflowX),
    y: allowValues.includes(overflowY),
  }
}

/** Whether the content overflows on each axis, whatever the `overflow` style says. */
export function hasScrollbar(el: HTMLElement) {
  const { scrollHeight, clientHeight, scrollWidth, clientWidth } = el

  return {
    x: scrollWidth > clientWidth,
    y: scrollHeight > clientHeight,
  }
}

export function getScrollTarget(el: HTMLElement, isHorizontal?: boolean): Window | HTMLElement {
  const windowTop = getWindowTop()
  let parent: HTMLElement = el

  const direction = isHorizontal ? 'x' : 'y'

  while (parent) {
    if (windowTop.includes(parent)) {
      return window
    }

    if (isScrollable(parent)[direction]) {
      return parent
    }

    parent = parent.parentNode as HTMLElement
  }

  return parent
}

// Get the scrollable element's DOM object, usually used for reading scroll offsets.
export function getScrollElement(target?: Window | Document | HTMLElement | null): HTMLElement {
  if (!target || getWindowTop().includes(target as HTMLElement)) {
    return document.documentElement
  }

  return target as HTMLElement
}

/** Event target for scroll listeners. Document scrolling fires on `window`, not `documentElement`. */
export function getScrollListener(target?: Window | Document | HTMLElement | null) {
  if (!target || getWindowTop().includes(target as HTMLElement)) {
    return window
  }

  return target as HTMLElement
}

function finite(value: number | undefined): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

export function getScrollPosition(el: HTMLElement | Window | Document) {
  const target = el instanceof HTMLElement ? el : document.documentElement

  return {
    scrollTop: finite(target.scrollTop),
    scrollLeft: finite(target.scrollLeft),
    scrollWidth: finite(target.scrollWidth),
    scrollHeight: finite(target.scrollHeight),
    clientWidth: finite(target.clientWidth),
    clientHeight: finite(target.clientHeight),
  }
}

/** The element itself scrolls: it may scroll by style and its content overflows. */
function isOverflowScroller(ele: Element): boolean {
  const { x: xScrollbar, y: yScrollbar } = hasScrollbar(ele as HTMLElement)
  const { x: xScrollable, y: yScrollable } = isScrollable(ele as HTMLElement)

  return (xScrollbar && xScrollable) || (yScrollbar && yScrollable)
}

/** Whether the element or one of its ancestors up to `<body>` really scrolls. */
export function isOverflowScrollable(ele: Element): boolean {
  if (isOverflowScroller(ele)) {
    return true
  }

  const parent = ele.parentNode

  if (!(parent instanceof Element) || parent.tagName === 'BODY') {
    return false
  }

  return isOverflowScrollable(parent)
}

/** Extra time granted past the longest animation before the wait gives up on it. */
const ANIMATION_WAIT_GRACE = 1000

export async function awaitAnimationEnd(element?: Element) {
  // Only finite animations can end: an infinite one never resolves `finished`, and a pending one
  // (a hidden tab, a skipped subtree) may never even start.
  const running = (element?.getAnimations?.() ?? []).flatMap((animation) => {
    const endTime = animation.effect?.getComputedTiming().endTime

    if (typeof endTime !== 'number' || !Number.isFinite(endTime)) {
      return []
    }

    const currentTime = typeof animation.currentTime === 'number' ? animation.currentTime : 0

    return [{ animation, remaining: Math.max(0, endTime - currentTime) }]
  })

  if (running.length === 0) {
    return
  }

  // Waiting on `finished` alone wedges the caller's queue for good when the animation never
  // starts, so the wait is capped by the longest animation that is actually running.
  const limit = Math.max(...running.map((entry) => entry.remaining)) + ANIMATION_WAIT_GRACE
  let timer: ReturnType<typeof setTimeout> | undefined

  try {
    await Promise.race([
      Promise.allSettled(running.map((entry) => entry.animation.finished)),
      new Promise((resolve) => {
        timer = setTimeout(resolve, limit)
      }),
    ])
  } finally {
    if (timer != null) {
      clearTimeout(timer)
    }
  }
}

export function resolveScrollBehavior(
  behavior: ScrollBehavior,
  prefersMotionReduce?: MaybeRefOrGetter<boolean>,
): ScrollBehavior {
  if (behavior === 'auto') {
    return toValue(prefersMotionReduce) ? 'instant' : 'smooth'
  }

  return behavior
}
