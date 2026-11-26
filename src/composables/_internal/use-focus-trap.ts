import type { MaybeElementRef } from '../../types/shared/utils'
import type { FocusTrap, Options as FocusTrapOptions } from 'focus-trap'
import type { MaybeRefOrGetter } from 'vue'
import { createFocusTrap } from 'focus-trap'
import { onScopeDispose, watch, toValue } from 'vue'
import { FOCUSABLE_SELECTOR } from '../../constants/focus.js'
import { isTruthyProp } from '../../utils/format.js'

const focusTrapStack: FocusTrap[] = []

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
      // The library defers the return by a tick; the closing panel is hidden from AT in the render
      // that follows, so focus has to be back outside it before that, not after.
      delayReturnFocus: false,
      preventScroll: true,
      fallbackFocus: () => target,
      initialFocus: (): HTMLElement => {
        // auto focus first tabbable element or custom element
        if (isTruthyProp(autoFocusElement)) {
          const elSelector =
            typeof autoFocusElement === 'string' && autoFocusElement
              ? autoFocusElement
              : FOCUSABLE_SELECTOR

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

  // A closing panel is marked `aria-hidden` / `inert` in the same flush, and the browser refuses to
  // hide a subtree that still holds focus. Releasing before that render returns focus to the trigger
  // first; deactivating post-render leaves a frame where the focused node is hidden from AT.
  const unwatchRelease = watch(
    () => toValue(container),
    (target) => {
      if (!target) {
        deactivate()
      }
    },
    { flush: 'pre' },
  )

  // Activating still waits for the post flush: a panel that just opened is not in the DOM before it.
  const unwatchTrap = watch(
    () => toValue(container),
    (target) => {
      if (!target) {
        return
      }

      deactivate()
      activate(target)
    },
    { flush: 'post' },
  )

  function stop() {
    unwatchRelease()
    unwatchTrap()
    deactivate()
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    stop,
  }
}
