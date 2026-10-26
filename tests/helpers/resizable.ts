import type { VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

export const CONTAINER_SIZE = 1000

let containerSize = CONTAINER_SIZE
const sizeByElement = new WeakMap<HTMLElement, number>()

// happy-dom reports no layout, so the container's measured box is faked here. The
// component reads it on mount, on pointer down and from its resize observer.
function stubOffset(name: 'offsetWidth' | 'offsetHeight') {
  const original = Object.getOwnPropertyDescriptor(HTMLElement.prototype, name)

  Object.defineProperty(HTMLElement.prototype, name, {
    configurable: true,
    get(this: HTMLElement) {
      if (!this.classList.contains('pxd-resizable')) {
        return original?.get?.call(this) ?? 0
      }

      return sizeByElement.get(this) ?? containerSize
    },
  })
}

stubOffset('offsetWidth')
stubOffset('offsetHeight')

/** Resize the container the group measures itself against. */
export function setContainerSize(size: number) {
  containerSize = size
}

/** Give one group its own measured width, for nested layouts. */
export function setElementSize(element: HTMLElement, size: number) {
  sizeByElement.set(element, size)
}

// happy-dom has no pointer capture, and a stubbed capture is enough: the events
// are dispatched on the handle itself, which is what a real capture retargets to.
;(Element.prototype as any).setPointerCapture ??= () => {}
;(Element.prototype as any).releasePointerCapture ??= () => {}

export function createPointerEvent(
  type: string,
  init: { x?: number; y?: number; pointerId?: number } = {},
) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    clientX: init.x ?? 0,
    clientY: init.y ?? 0,
    pointerId: init.pointerId ?? 1,
  })
}

export async function flush(times = 4) {
  for (let i = 0; i < times; i++) {
    await nextTick()
  }
}

/** Panel sizes as actually rendered, i.e. what a user would see. */
export function readSizes(wrapper: VueWrapper<any>): number[] {
  return wrapper.findAll('.pxd-resizable--panel').map((node) => {
    const matched = /flex-basis:\s*([\d.]+)(?:%|px)/.exec(node.attributes('style') || '')

    return matched ? Number(matched[1]) : 0
  })
}

export function roundSizes(sizes: number[]): number[] {
  return sizes.map((size) => Math.round(size * 100) / 100)
}

export function total(sizes: number[]): number {
  return sizes.reduce((sum, size) => sum + size, 0)
}

/**
 * Drag along one axis. The handle captures the pointer, so move and up land on
 * the handle element rather than on whatever sits under the pointer.
 */
export function drag(handle: Element, from: number, to: number, axis: 'x' | 'y' = 'x') {
  const point = (value: number) => (axis === 'x' ? { x: value } : { y: value })

  handle.dispatchEvent(createPointerEvent('pointerdown', point(from)))
  handle.dispatchEvent(createPointerEvent('pointermove', point(to)))
  handle.dispatchEvent(createPointerEvent('pointerup', point(to)))
}
