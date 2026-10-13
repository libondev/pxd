import type { UseFocusTrapOptions } from './use-focus-trap.js'
import type { Ref } from 'vue'
import { computed } from 'vue'
import { isTruthyProp } from '../../utils/format.js'
import { useFocusTrap } from './use-focus-trap.js'

interface OverlayDialogProps {
  autoFocusElement?: string | boolean
  closeOnPressEscape?: boolean
  closeOnClickOverlay?: boolean
  loading?: boolean
}

interface OverlayDialogEmits {
  (event: 'outside-click', ev: PointerEvent): void
}

interface OverlayDialogOptions {
  props: OverlayDialogProps
  emits: OverlayDialogEmits
  elementRef: Ref<HTMLElement | undefined>
  onClose: () => void
}

/**
 * Shared dialog (Modal/Drawer) behaviors: focus trap wiring and overlay
 * click/escape close handlers.
 */
export function useOverlayDialog({ props, emits, elementRef, onClose }: OverlayDialogOptions): {
  closeOverlayIfNeed: () => void
  onOverlayClick: (ev: PointerEvent) => void
} {
  // Esc and outside clicks only request a close (vetoed while loading) — never deactivate the trap.
  const focusTrapOptions = computed<UseFocusTrapOptions>(() => ({
    autoFocusElement: props.autoFocusElement,
  }))

  useFocusTrap(elementRef, focusTrapOptions)

  function closeOverlayIfNeed() {
    if (isTruthyProp(props.loading)) {
      return
    }

    onClose()
  }

  function onOverlayClick(ev: PointerEvent) {
    emits('outside-click', ev)

    if (!isTruthyProp(props.closeOnClickOverlay)) {
      return
    }

    closeOverlayIfNeed()
  }

  return { closeOverlayIfNeed, onOverlayClick }
}
