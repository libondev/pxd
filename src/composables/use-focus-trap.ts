import type { MaybeElementRef } from '../types/shared/utils'
import type { FocusTrap, Options as FocusTrapOptions } from 'focus-trap'
import { createFocusTrap } from 'focus-trap'
import { onScopeDispose, watch, type MaybeRefOrGetter } from 'vue'
import { toValue } from '../utils/ref'

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

  const unwatch = watch(
    () => toValue(container),
    (target, _, onCleanup) => {
      if (!target) {
        return
      }

      const { autoFocusElement, ...restOptions } = toValue(userOptions)

      const defaultOptions: FocusTrapOptions = {
        allowOutsideClick: true,
        escapeDeactivates: false,
        clickOutsideDeactivates: false,

        // A11y + robustness
        returnFocusOnDeactivate: true,
        preventScroll: true,
        fallbackFocus: () => target,
        initialFocus: (): HTMLElement => {
          // auto focus first tabbable element or custom element

          if (autoFocusElement) {
            const elSelector =
              typeof autoFocusElement === 'boolean' ? AUTO_FOCUS_FIRST_SELECTOR : autoFocusElement

            return target.querySelector<HTMLElement>(elSelector) ?? target
          }

          return target
        },

        // Coordinate nested PXD dialogs
        trapStack: focusTrapStack,
      }

      trapper = createFocusTrap(target, { ...defaultOptions, ...restOptions })
      trapper.activate()

      onCleanup(() => {
        trapper!.deactivate()
        trapper = null
      })
    },
    { flush: 'post' },
  )

  onScopeDispose(() => {
    unwatch()
  })

  return {
    stop: unwatch,
  }
}
