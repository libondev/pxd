export function pointerEvent(type: string, { x = 0, y = 0 }: { x?: number; y?: number } = {}) {
  const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent

  Object.defineProperties(event, {
    button: { value: 0 },
    clientX: { value: x },
    clientY: { value: y },
    isPrimary: { value: true },
    pointerId: { value: 1 },
    pointerType: { value: 'touch' },
  })

  return event
}

export function setElementSize(el: HTMLElement, size: number) {
  Object.defineProperty(el, 'offsetWidth', { configurable: true, value: size })
  Object.defineProperty(el, 'offsetHeight', { configurable: true, value: size })
}
