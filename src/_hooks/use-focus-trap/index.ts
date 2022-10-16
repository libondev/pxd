import { type Ref, onBeforeUnmount } from 'vue'

import { INTERACTIVE_ELEMENTS, noop } from '../../_internal'

interface FocusTrapReturnType {
  activate: typeof noop
  deactivate: typeof noop
}

export function useFocusTrap (targetRef: Ref<HTMLElement>): FocusTrapReturnType {
  let deactivate = noop

  function activate (): void {
    Promise.resolve().then(() => {
      const targetElement = targetRef.value

      if (!targetElement) {
        return
      }

      targetElement.focus()

      const focusableElements = targetElement.querySelectorAll<HTMLElement>(INTERACTIVE_ELEMENTS)
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]

      function setFocusTrap (evt: KeyboardEvent): void {
        if (evt.key !== 'Tab') {
          return
        }

        if (evt.shiftKey && document.activeElement === firstElement) /* shift + tab */ {
          evt.preventDefault()
          lastElement.focus()
          return
        }

        if (document.activeElement === lastElement) /* tab */ {
          evt.preventDefault()
          firstElement.focus()
        }
      }

      targetElement.addEventListener('keydown', setFocusTrap)

      deactivate = () => {
        targetElement.removeEventListener('keydown', setFocusTrap)
        deactivate = noop
      }
    }).catch(noop)
  }

  onBeforeUnmount(() => {
    deactivate()
  })

  return {
    activate,
    deactivate
  }
}
