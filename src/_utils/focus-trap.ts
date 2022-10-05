import {
  type ActivateOptions,
  type DeactivateOptions,
  type FocusTrap,
  type Options,
  createFocusTrap
} from 'focus-trap'
import { type Ref, onBeforeUnmount, watch } from 'vue'

interface FocusTrapOptions {
  immediate: false
}

interface FocusTrapReturnType {
  activate: () => FocusTrap
  deactivate: () => FocusTrap
}

export function useFocusTrap (
  targetRef: Ref<HTMLElement>,
  trapOptions?: FocusTrapOptions & Options
): FocusTrapReturnType {
  let trap: ReturnType<typeof createFocusTrap>

  const cleanWatch = watch(
    targetRef,
    (targetElement) => {
      if (!targetElement) {
        return
      }
      console.log(trap, targetElement)

      if (trap) {
        trap = trap.updateContainerElements(targetElement)
      } else {
        trap = createFocusTrap(targetElement, trapOptions)
      }
    },
    { flush: 'post' }
  )

  const activate = (options?: ActivateOptions): FocusTrap => trap && trap.activate(options)
  const deactivate = (options?: DeactivateOptions): FocusTrap => trap && trap.deactivate(options)

  onBeforeUnmount((): void => {
    cleanWatch && cleanWatch()
    deactivate()
  })

  return {
    activate,
    deactivate
  }
}
