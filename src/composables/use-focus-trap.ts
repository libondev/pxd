import type { FocusTrap, Options as FocusTrapOptions } from 'focus-trap'

import { createFocusTrap } from 'focus-trap'
import { onBeforeUnmount, watch } from 'vue'

import type { MaybeElementRef } from '../types/shared/utils'

import { toValue } from '../utils/ref'

const pxdFocusTrapStack: FocusTrap[] = []

/**
 * Best-practice defaults for dialogs (Modal/Drawer):
 * - Keep trap active unless component decides to close (avoid implicit deactivation).
 * - Always provide a fallback focus target to avoid runtime errors when no tabbables exist.
 * - Prevent scroll jumps caused by focusing.
 * - Share a trap stack among PXD traps so nested dialogs coordinate pause/unpause.
 */
export function useFocusTrap(
  container: MaybeElementRef<HTMLElement>,
  userOptions: FocusTrapOptions = {},
) {
  let trapper: FocusTrap | null = null

  const unwatch = watch(
    () => toValue(container),
    (target, _, onCleanup) => {
      if (!target) {
        return
      }

      const defaultOptions: FocusTrapOptions = {
        allowOutsideClick: true,
        escapeDeactivates: false,
        clickOutsideDeactivates: false,

        // A11y + robustness
        returnFocusOnDeactivate: true,
        preventScroll: true,
        fallbackFocus: () => target,
        initialFocus: () => target,

        // Coordinate nested PXD dialogs
        trapStack: pxdFocusTrapStack,
      }

      trapper = createFocusTrap(target, { ...defaultOptions, ...userOptions })
      trapper.activate()

      onCleanup(() => {
        trapper!.deactivate()
        trapper = null
      })
    },
    {
      flush: 'post',
    },
  )

  onBeforeUnmount(() => {
    unwatch()
  })

  return {
    stop: unwatch,
  }
}
