import type { CSSProperties } from 'vue'
import { camelize, toArray } from './format'
import { isServer } from './is'

export function getElementRectFromContainer(
  elementOrRect: HTMLElement | DOMRect,
  containerOrRect: HTMLElement | DOMRect,
) {
  const selfRect = elementOrRect instanceof HTMLElement ? elementOrRect.getBoundingClientRect() : elementOrRect
  const wrapRect = containerOrRect instanceof HTMLElement ? containerOrRect.getBoundingClientRect() : containerOrRect

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

export function getStyle(element: HTMLElement, styleNames: keyof CSSProperties | (keyof CSSProperties)[]): string[] {
  if (isServer || !element || !styleNames) {
    return []
  }

  const keys = toArray(styleNames).map((k) => {
    return k === 'float' ? 'cssFloat' : camelize(k)
  })

  const computedStyle = document.defaultView?.getComputedStyle(element, '') || element.style

  return keys.map(k => computedStyle[k as keyof CSSStyleDeclaration] as string)
}

export function isScrollable(el: HTMLElement) {
  const [x, y] = getStyle(el, ['overflow-x', 'overflow-y'])

  const allowValues = ['scroll', 'auto', 'overlay']

  // 由于 html 是最后的滚动容器，所以当子元素高度超过 html 的高度时
  // 即便没有设置 overflow 的为以上值时，html 依然是可以滚动的
  if (el.tagName === 'HTML') {
    allowValues.push('visible')
  }

  return {
    x: allowValues.includes(x),
    y: allowValues.includes(y),
  }
}

export function hasScrollbar(el: HTMLElement) {
  const { scrollHeight, clientHeight, scrollWidth, clientWidth } = el

  return {
    x: scrollWidth > clientWidth,
    y: scrollHeight > clientHeight,
  }
}

export function getScrollContainer(el: HTMLElement, isVertical?: boolean): Window | HTMLElement {
  const windowTop = [window, document, document.documentElement]
  let parent: HTMLElement = el

  const direction = isVertical ? 'y' : 'x'

  while (parent) {
    if (windowTop.includes(parent)) {
      return window
    }

    // 先判断是否可滚动, 如果可滚动再判断是否是滚动元素
    if (isScrollable(parent)[direction] && hasScrollbar(parent)[direction]) {
      return parent
    }

    parent = parent.parentNode as HTMLElement
  }

  return parent
}

export function getScrollPositions(el: HTMLElement | Window | Document) {
  let scrollTop = 0
  let scrollLeft = 0
  let scrollWidth = 0
  let scrollHeight = 0

  const targetEl = el instanceof HTMLElement ? el : document.documentElement

  scrollTop = targetEl.scrollTop
  scrollLeft = targetEl.scrollLeft
  scrollWidth = targetEl.scrollWidth
  scrollHeight = targetEl.scrollHeight

  return {
    scrollTop,
    scrollLeft,
    scrollWidth,
    scrollHeight,
  }
}

// 获取滚动元素的 DOM 对象, 通常用户获取滚动距离
export function getScrollElByContainer(target: any) {
  const windowTop = [window, document, document.documentElement]
  if (!target || windowTop.includes(target)) {
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

// export function checkOverflowScroll(ele: Element): boolean {
//   const style = window.getComputedStyle(ele)
//   if (
//     style.overflowX === 'scroll'
//     || style.overflowY === 'scroll'
//     || (style.overflowX === 'auto' && ele.clientWidth < ele.scrollWidth)
//     || (style.overflowY === 'auto' && ele.clientHeight < ele.scrollHeight)
//   ) {
//     return true
//   }

//   const parent = ele.parentNode

//   if (!(parent instanceof Element) || parent.tagName === 'BODY') {
//     return false
//   }

//   return checkOverflowScroll(parent)
// }
