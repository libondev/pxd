import { nextTick, onBeforeUnmount, shallowRef, watch } from 'vue'
import { on } from '../utils/events'

export function useFocusTrap() {
  const containerRef = shallowRef<HTMLElement>()

  const selectors = ['input:not([inert])', 'select:not([inert])', 'textarea:not([inert])', 'a[href]:not([inert])', 'button:not([inert])', '[tabindex]:not(slot):not([inert])', 'audio[controls]:not([inert])', 'video[controls]:not([inert])', '[contenteditable]:not([contenteditable="false"]):not([inert])', 'details>summary:first-of-type:not([inert])', 'details:not([inert])']

  let elements: HTMLElement[] = []
  let previousFocusedElement: HTMLElement | null = null

  function onContainerKeydown(ev: KeyboardEvent) {
    if (ev.key !== 'Tab' || !elements.length) {
      return
    }

    ev.preventDefault()

    const focusIndex = elements.indexOf(document.activeElement as HTMLElement)
    const offset = ev.shiftKey ? -1 : 1
    const nextFocusIndex = (focusIndex + offset + elements.length) % elements.length

    elements[nextFocusIndex]?.focus()
  }

  watch(() => containerRef.value, (container, _, onCleanup) => {
    if (!container) {
      previousFocusedElement?.focus()
      return
    }

    previousFocusedElement = document.activeElement as HTMLElement

    nextTick(() => {
      const unbindEvent = on(container, 'keydown', onContainerKeydown)
      elements = Array.from(container.querySelectorAll<HTMLElement>(selectors.join(',')))

      if (elements.length) {
        elements[0].focus()
      } else {
        container.focus({ preventScroll: true })
      }

      onCleanup(() => {
        unbindEvent()
        elements = []
      })
    })
  })

  onBeforeUnmount(() => {
    elements = []
    previousFocusedElement = null
  })

  return {
    containerRef,
  }
}
