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
