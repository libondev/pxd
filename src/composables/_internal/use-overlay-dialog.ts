import type { UseFocusTrapOptions } from './use-focus-trap.js'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import { isTruthyProp } from '../../utils/format.js'
import { useFocusTrap } from './use-focus-trap.js'

/** The three ways a dialog closes on its own, each with its own word. */
export type OverlayCloseReason = 'escape-key' | 'outside-press' | 'close-press'

interface OverlayDialogOptions {
  autoFocusElement?: MaybeRefOrGetter<string | boolean | undefined>
  loading?: MaybeRefOrGetter<boolean | undefined>
  closeOnClickOverlay?: MaybeRefOrGetter<boolean | undefined>
  elementRef: Ref<HTMLElement | undefined>
  onOutsideClick?: (ev: PointerEvent) => void
  onClose: (reason: OverlayCloseReason) => void
}

/**
 * Shared dialog (Modal/Drawer) behaviors: focus trap wiring and overlay
 * click/escape close handlers.
 */
export function useOverlayDialog(options: OverlayDialogOptions): {
  closeOverlayIfNeed: (reason: OverlayCloseReason) => void
  onOverlayClick: (ev: PointerEvent) => void
} {
  // Esc and outside clicks only request a close (vetoed while loading) - never deactivate the trap.
  const focusTrapOptions = computed<UseFocusTrapOptions>(() => ({
    autoFocusElement: toValue(options.autoFocusElement),
  }))

  useFocusTrap(options.elementRef, focusTrapOptions)

  function closeOverlayIfNeed(reason: OverlayCloseReason) {
    if (isTruthyProp(toValue(options.loading))) {
      return
    }

    options.onClose(reason)
  }

  function onOverlayClick(ev: PointerEvent) {
    options.onOutsideClick?.(ev)

    if (!isTruthyProp(toValue(options.closeOnClickOverlay))) {
      return
    }

    closeOverlayIfNeed('outside-press')
  }

  return { closeOverlayIfNeed, onOverlayClick }
}
