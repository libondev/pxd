import type { CSSProperties } from 'vue'
import { camelize } from 'vue'
import { isClient } from './is'

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

export function getStyle(element: HTMLElement, styleName: keyof CSSProperties): string {
  if (!isClient || !element || !styleName) {
    return ''
  }

  let key = camelize(styleName)
  if (key === 'float') {
    key = 'cssFloat'
  }
  try {
    const style = (element.style as any)[key]
    if (style) {
      return style
    }
    const computed: any = document.defaultView?.getComputedStyle(element, '')
    return computed ? computed[key] : ''
  } catch {
    return (element.style as any)[key]
  }
}

export function hasScrollbar(el: HTMLElement, isVertical?: boolean): boolean {
  if (isVertical) {
    return el.scrollHeight > el.clientHeight
  }

  return el.scrollWidth > el.clientWidth
}

// https://github.com/element-plus/element-plus/blob/8ddbb1d85a706e9a2fce3aeeb347fc0346949f86/packages/utils/dom/scroll.ts
export function isScrollable(el: HTMLElement, isVertical?: boolean): boolean {
  const key = (
    {
      undefined: 'overflow',
      true: 'overflow-y',
      false: 'overflow-x',
    } as const
  )[String(isVertical)]!

  const overflow = getStyle(el, key)

  return ['scroll', 'auto', 'overlay'].some(s => overflow.includes(s))
}

const windowTop = [globalThis, globalThis.document, globalThis.document.documentElement] as const
export function getScrollContainer(el: HTMLElement, isVertical?: boolean): Window | HTMLElement {
  let parent: HTMLElement = el

  while (parent) {
    if (windowTop.includes(parent)) {
      return window
    }

    // 先判断是否可滚动, 如果可滚动再判断是否是滚动元素
    if (isScrollable(parent, isVertical) && hasScrollbar(parent, isVertical)) {
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

export interface ScrollbarSize {
  width: number // 垂直滚动条宽度
  height: number // 水平滚动条高度
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
  const verticalScrollable = isScrollable(element, true)
  const horizontalScrollable = isScrollable(element, false)
  const hasVerticalScrollbar = verticalScrollable && hasScrollbar(element, true)
  const hasHorizontalScrollbar = horizontalScrollable && hasScrollbar(element, false)

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
