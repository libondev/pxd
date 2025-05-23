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
