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
  // 如果未提供元素，则创建临时元素测量全局滚动条
  if (!element) {
    const div = document.createElement('div')
    div.style.cssText = 'width: 100px; height: 100px; overflow: scroll; position: absolute; top: -9999px; visibility: hidden; box-sizing: content-box;'
    document.body.appendChild(div)

    const size = {
      width: div.offsetWidth - div.clientWidth,
      height: div.offsetHeight - div.clientHeight,
    }

    document.body.removeChild(div)
    return size
  }

  // 测量特定元素的滚动条
  const { x: isXScrollable, y: isYScrollable } = isScrollable(element)
  const { x: hasXScrollbar, y: hasYScrollbar } = hasScrollbar(element)
  const hasVerticalScrollbar = isYScrollable && hasYScrollbar
  const hasHorizontalScrollbar = isXScrollable && hasXScrollbar

  // 创建克隆元素进行测量，避免原始元素样式干扰
  if (hasVerticalScrollbar || hasHorizontalScrollbar) {
    const clone = element.cloneNode(true) as HTMLElement
    clone.style.visibility = 'hidden'
    clone.style.position = 'absolute'
    clone.style.top = '-9999px'
    clone.style.overflow = 'auto' // 确保可以测量滚动条

    // 将克隆元素添加到DOM并设置与原始元素相同的尺寸
    document.body.appendChild(clone)
    clone.style.width = `${element.offsetWidth}px`
    clone.style.height = `${element.offsetHeight}px`

    const verticalWidth = hasVerticalScrollbar ? (clone.offsetWidth - clone.clientWidth) : 0
    const horizontalHeight = hasHorizontalScrollbar ? (clone.offsetHeight - clone.clientHeight) : 0

    document.body.removeChild(clone)

    return {
      width: verticalWidth,
      height: horizontalHeight,
    }
  }

  return { width: 0, height: 0 }
}
