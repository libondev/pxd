import type { MaybeElementRef } from '../../types/shared/utils'
import type { FocusTrap, Options as FocusTrapOptions } from 'focus-trap'
import { createFocusTrap } from 'focus-trap'
import { onScopeDispose, watch, type MaybeRefOrGetter } from 'vue'
import { isTruthyProp } from '../../utils/format.js'
import { toValue } from '../../utils/helper.js'

const focusTrapStack: FocusTrap[] = []

// e.g.: filter input element in popover/modal/drawer components
const AUTO_FOCUS_FIRST_SELECTOR = [
  'input:not([type="hidden"]):not(:disabled)',
  'button:not(:disabled)',
  'select:not(:disabled)',
  'textarea:not(:disabled)',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

export interface UseFocusTrapOptions extends FocusTrapOptions {
  autoFocusElement?: string | boolean
}

/**
 * Best-practice defaults for dialogs (Modal/Drawer/Popover):
 * - Keep trap active unless component decides to close (avoid implicit deactivation).
 * - Always provide a fallback focus target to avoid runtime errors when no tabbables exist.
 * - Prevent scroll jumps caused by focusing.
 * - Share a trap stack among PXD traps so nested dialogs coordinate pause/unpause.
 */
export function useFocusTrap(
  container: MaybeElementRef<HTMLElement>,
  userOptions: MaybeRefOrGetter<UseFocusTrapOptions> = {},
) {
  let trapper: FocusTrap | null = null

  function deactivate() {
    trapper?.deactivate()
    trapper = null
  }

  function activate(target: HTMLElement) {
    const { autoFocusElement, ...restOptions } = toValue(userOptions)

    const defaultOptions: FocusTrapOptions = {
      allowOutsideClick: true,
      escapeDeactivates: false,
      clickOutsideDeactivates: false,

      // A11y + robustness
      // If set and is or returns true, a click outside the focus trap will not be prevented
      returnFocusOnDeactivate: true,
      preventScroll: true,
      fallbackFocus: () => target,
      initialFocus: (): HTMLElement => {
        // auto focus first tabbable element or custom element
        if (isTruthyProp(autoFocusElement)) {
          const elSelector =
            typeof autoFocusElement === 'string' && autoFocusElement
              ? autoFocusElement
              : AUTO_FOCUS_FIRST_SELECTOR

          return target.querySelector<HTMLElement>(elSelector) ?? target
        }

        return target
      },

      // Coordinate nested PXD dialogs
      trapStack: focusTrapStack,
    }

    trapper = createFocusTrap(target, { ...defaultOptions, ...restOptions })
    trapper.activate()
  }

  const unwatch = watch(
    () => toValue(container),
    (target) => {
      deactivate()

      if (!target) {
        return
      }

      activate(target)
    },
    { flush: 'post' },
  )

  function stop() {
    unwatch()
    deactivate()
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    stop,
  }
}
