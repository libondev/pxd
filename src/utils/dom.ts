import type { Nullable } from '../types/shared/utils'
import type { ComponentPublicInstance } from 'vue'
import { isServer } from './is'
import { unrefElement } from './ref'

function getWindowTop() {
  return [window, document, document.documentElement]
}

export function getElement(
  el?: Nullable<string | object | HTMLElement | ComponentPublicInstance>,
): HTMLElement | null {
  if (!el) {
    return null
  }

  if (typeof el === 'string') {
    return document.querySelector(el)
  }

  if (el instanceof Element) {
    return el as HTMLElement
  }

  return unrefElement(el as ComponentPublicInstance) as HTMLElement
}

export function getElementRectFromContainer(
  elementOrRect: Element | DOMRect,
  viewportOrRect: Element | DOMRect,
) {
  const selfRect =
    elementOrRect instanceof Element ? elementOrRect.getBoundingClientRect() : elementOrRect
  const wrapRect =
    viewportOrRect instanceof Element ? viewportOrRect.getBoundingClientRect() : viewportOrRect

  return {
    top: selfRect.top,
    bottom: selfRect.bottom,
    left: selfRect.left,
    right: selfRect.right,
    width: selfRect.width,
    height: selfRect.height,
    scrollTop: selfRect.top - wrapRect.top,
    scrollBottom: selfRect.bottom - wrapRect.top,
    scrollLeft: selfRect.left - wrapRect.left,
    scrollRight: selfRect.right - wrapRect.left,
  }
}

export function getStyle(el: HTMLElement): CSSStyleDeclaration {
  if (isServer() || !el) {
    return {} as CSSStyleDeclaration
  }

  return document.defaultView?.getComputedStyle(el, null) || el.style
}

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

export function hasScrollbar(el: HTMLElement) {
  const { scrollHeight, clientHeight, scrollWidth, clientWidth } = el

  return {
    x: scrollWidth > clientWidth,
    y: scrollHeight > clientHeight,
  }
}

export function getScrollContainer(el: HTMLElement, isHorizontal?: boolean): Window | HTMLElement {
  const windowTop = getWindowTop()
  let parent: HTMLElement = el

  const direction = isHorizontal ? 'x' : 'y'

  while (parent) {
    if (windowTop.includes(parent)) {
      return window
    }

    if (isScrollable(parent)[direction] && hasScrollbar(parent)[direction]) {
      return parent
    }

    parent = parent.parentNode as HTMLElement
  }

  return parent
}

export function getScrollPositions(el: HTMLElement | Window | Document) {
  const targetEl = el instanceof HTMLElement ? el : document.documentElement

  return {
    scrollTop: targetEl.scrollTop,
    scrollLeft: targetEl.scrollLeft,
    scrollWidth: targetEl.scrollWidth,
    scrollHeight: targetEl.scrollHeight,
  }
}

// 获取滚动元素的 DOM 对象, 通常用户获取滚动距离
export function getScrollElByContainer(target: any): HTMLElement {
  if (!target || getWindowTop().includes(target)) {
    return document.documentElement
  }

  return target as HTMLElement
}

export interface ScrollbarSize {
  width: number
  height: number
}

/**
 * 获取滚动条尺寸（宽度和高度）
 * @param element - 要测量的元素，默认为document.body
 * @returns 包含滚动条宽度和高度的对象
 */
export function getScrollbarSize(element?: HTMLElement): ScrollbarSize {
  if (!element) {
    const div = document.createElement('div')
    div.style.cssText =
      'width:50px;height:50px;overflow:scroll;position:absolute;top:-9999px;visibility:hidden;box-sizing:content-box'
    document.body.appendChild(div)

    const size = {
      width: div.offsetWidth - div.clientWidth,
      height: div.offsetHeight - div.clientHeight,
    }

    document.body.removeChild(div)
    return size
  }

  if ([document.body, document.documentElement].includes(element)) {
    return {
      width: window.innerWidth - element.clientWidth,
      height: window.innerHeight - element.clientHeight,
    }
  }

  return {
    width: element.offsetWidth - element.clientWidth,
    height: element.offsetHeight - element.clientHeight,
  }
}

// Gets the size of the window visible area
export function getViewportRect() {
  const rect = document.documentElement.getBoundingClientRect()

  rect.width = document.documentElement.clientWidth
  rect.height = document.documentElement.clientHeight

  return rect as DOMRect
}

export function isOverflowScrollable(ele: Element): boolean {
  const { x: xScrollbar, y: yScrollbar } = hasScrollbar(ele as HTMLElement)
  const { x: xScrollable, y: yScrollable } = isScrollable(ele as HTMLElement)

  if ((xScrollbar && xScrollable) || (yScrollbar && yScrollable)) {
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
