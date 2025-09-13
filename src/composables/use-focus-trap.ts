import type { MaybeElementRef } from '../types/shared/utils'
import { nextTick, onBeforeUnmount, watch } from 'vue'
import { on } from '../utils/event'
import { toValue } from '../utils/ref'
import { PRESET_MEDIA_QUERIES, useMediaQuery } from './use-media-query'

export function useFocusTrap(container: MaybeElementRef<HTMLElement>) {
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

  const isSmUp = useMediaQuery(PRESET_MEDIA_QUERIES.SM_UP)

  function onContainerKeydown(ev: KeyboardEvent) {
    if (ev.key !== 'Tab' || !elements.length) {
      return
    }

    ev.preventDefault()

    const focusIndex = elements.indexOf(document.activeElement as HTMLElement)
    const offset = ev.shiftKey ? -1 : 1
    const nextFocusIndex = (focusIndex + offset + elements.length) % elements.length

    elements[nextFocusIndex]?.focus({ preventScroll: true })
  }

  const unwatch = watch(() => toValue(container), async (target, _, onCleanup) => {
    if (!target) {
      return
    }

    await nextTick()

    const unbindEvent = on(target, 'keydown', onContainerKeydown)
    elements = [...target.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS)]

    // Cancel autofocus on small screen to avoid automatic page scaling
    if (elements.length && isSmUp.value) {
      elements[0].focus({ preventScroll: true })
    }

    onCleanup(() => {
      unbindEvent()
      elements = []
    })
  })

  onBeforeUnmount(() => {
    unwatch()
    elements = []
  })

  return {
    stop: unwatch,
  }
}
