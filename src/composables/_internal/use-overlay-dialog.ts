import type { UseFocusTrapOptions } from './use-focus-trap.js'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, toValue } from 'vue'
import { isTruthyProp } from '../../utils/format.js'
import { useFocusTrap } from './use-focus-trap.js'

interface OverlayDialogOptions {
  autoFocusElement?: MaybeRefOrGetter<string | boolean | undefined>
  loading?: MaybeRefOrGetter<boolean | undefined>
  closeOnClickOverlay?: MaybeRefOrGetter<boolean | undefined>
  elementRef: Ref<HTMLElement | undefined>
  onOutsideClick?: (ev: PointerEvent) => void
  onClose: () => void
}

/**
 * Shared dialog (Modal/Drawer) behaviors: focus trap wiring and overlay
 * click/escape close handlers.
 */
export function useOverlayDialog(options: OverlayDialogOptions): {
  closeOverlayIfNeed: () => void
  onOverlayClick: (ev: PointerEvent) => void
} {
  // Esc and outside clicks only request a close (vetoed while loading) - never deactivate the trap.
  const focusTrapOptions = computed<UseFocusTrapOptions>(() => ({
    autoFocusElement: toValue(options.autoFocusElement),
  }))

  useFocusTrap(options.elementRef, focusTrapOptions)

  function closeOverlayIfNeed() {
    if (isTruthyProp(toValue(options.loading))) {
      return
    }

    options.onClose()
  }

  function onOverlayClick(ev: PointerEvent) {
    options.onOutsideClick?.(ev)

    if (!isTruthyProp(toValue(options.closeOnClickOverlay))) {
      return
    }

    closeOverlayIfNeed()
  }

  return { closeOverlayIfNeed, onOverlayClick }
}
