import { isServer } from './is'

function getWindowTop() {
  return [window, document, document.documentElement]
}

export function getElementRectFromContainer(
  elementOrRect: Element | DOMRect,
  viewportOrRect: Element | DOMRect,
) {
  const selfRect = elementOrRect instanceof Element ? elementOrRect.getBoundingClientRect() : elementOrRect
  const wrapRect = viewportOrRect instanceof Element ? viewportOrRect.getBoundingClientRect() : viewportOrRect

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
  if (isServer || !el) {
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
    div.style.cssText = 'width:50px;height:50px;overflow:scroll;position:absolute;top:-9999px;visibility:hidden;box-sizing:content-box'
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
