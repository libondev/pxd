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
  el = toValue(el)

  if (!el || isServer()) {
    return null
  }

  if (typeof el === 'string') {
    return (toValue(from) || document).querySelector(el)
  }

  if (el instanceof Element) {
    return el as HTMLElement
  }

  return (el as ComponentPublicInstance)?.$el ?? el
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

export function getScrollPosition(el: HTMLElement | Window | Document) {
  const target = el instanceof HTMLElement ? el : document.documentElement

  return {
    scrollTop: target.scrollTop,
    scrollLeft: target.scrollLeft,
    scrollWidth: target.scrollWidth,
    scrollHeight: target.scrollHeight,
    clientWidth: target.clientWidth,
    clientHeight: target.clientHeight,
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

export async function awaitAnimationEnd(element?: Element) {
  const animations = element?.getAnimations?.() ?? []
  await Promise.allSettled(animations.map((a) => a.finished))
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
