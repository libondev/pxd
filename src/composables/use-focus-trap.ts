import type { Ref } from 'vue'
import { nextTick, onBeforeUnmount, watch } from 'vue'
import { on } from '../utils/events'

export function useFocusTrap(containerRef: Ref<HTMLElement | undefined>) {
  const FOCUSABLE_SELECTORS = [
    ':focus',
    'a[href]:not([tabindex^="-"])',
    'area[href]:not([tabindex^="-"])',
    'video[controls]:not([tabindex^="-"])',
    'audio[controls]:not([tabindex^="-"])',
    'iframe:not([tabindex^="-"])',
    '[tabindex]:not(slot):not([tabindex^="-"])',
    '[contenteditable]:not([contenteditable="false"]):not([tabindex^="-"])',
    'details > summary:first-of-type:not([tabindex^="-"])',
    'input:not([type="hidden"]):not(fieldset[disabled] input):not([disabled]):not([tabindex^="-"])',
    'select:not(fieldset[disabled] input):not([disabled]):not([tabindex^="-"])',
    'textarea:not(fieldset[disabled] input):not([disabled]):not([tabindex^="-"])',
    'button:not(fieldset[disabled] input):not([disabled]):not([tabindex^="-"])',
    'fieldset[disabled]:not(fieldset[disabled] fieldset) > legend input:not([type="hidden"]):not([disabled]):not([tabindex^="-"])',
    'fieldset[disabled]:not(fieldset[disabled] fieldset) > legend select:not([disabled]):not([tabindex^="-"])',
    'fieldset[disabled]:not(fieldset[disabled] fieldset) > legend textarea:not([disabled]):not([tabindex^="-"])',
    'fieldset[disabled]:not(fieldset[disabled] fieldset) > legend button:not([disabled]):not([tabindex^="-"])',
    '[class*="focusable"]:not([disabled]):not([tabindex^="-"])',
  ].join(',')

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

  const unwatch = watch(() => containerRef.value, (container, _, onCleanup) => {
    if (!container) {
      previousFocusedElement?.focus()
      return
    }

    previousFocusedElement = document.activeElement as HTMLElement

    nextTick(() => {
      const unbindEvent = on(container, 'keydown', onContainerKeydown)
      elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS))

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
    unwatch()
    elements = []
    previousFocusedElement = null
  })

  return {
    containerRef,
    stop: unwatch,
  }
}
