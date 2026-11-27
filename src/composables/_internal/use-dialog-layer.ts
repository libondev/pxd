import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import { nextTick, onMounted, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { FOCUSABLE_SELECTOR } from '../../constants/focus.js'
import { isTruthyProp } from '../../utils/format.js'
import { useOverlayManager } from './use-overlay-manager.js'
import { getDialogLevel, pushTopLayer, removeTopLayer } from './use-top-layer.js'

/** The ways a dialog closes on its own, each with its own word. */
export type OverlayCloseReason = 'escape-key' | 'outside-press' | 'close-press' | 'swipe'

interface DialogLayerOptions {
  visible: MaybeRefOrGetter<boolean>
  loading?: MaybeRefOrGetter<boolean | undefined>
  initialFocus?: MaybeRefOrGetter<string | boolean | undefined>
  closeOnPressEscape?: MaybeRefOrGetter<boolean | undefined>
  closeOnOutsideClick?: MaybeRefOrGetter<boolean | undefined>
  onClose: (reason: OverlayCloseReason, event?: Event) => boolean | void
  onOutsidePress?: (ev: PointerEvent) => void
}

/** Owns the `<dialog>` a modal-like component renders: top-layer lifecycle, focus and dismissal. */
export function useDialogLayer(options: DialogLayerOptions) {
  const dialogRef = shallowRef<HTMLDialogElement>()
  const isClosing = shallowRef(false)

  let startSentinel: HTMLDivElement | undefined
  let endSentinel: HTMLDivElement | undefined

  function setDialogRef(element: Element | ComponentPublicInstance | null) {
    dialogRef.value = (element as HTMLDialogElement | null) ?? undefined
  }

  function closeIfAllowed(reason: OverlayCloseReason, event?: Event) {
    if (isTruthyProp(toValue(options.loading))) {
      return false
    }

    return event === undefined ? options.onClose(reason) : options.onClose(reason, event)
  }

  useOverlayManager({
    visible: options.visible,
    level: () => getDialogLevel(dialogRef.value),
    onPressEscape: (ev) => {
      // The dialog owns Escape: swallowing the default keeps the native `cancel` from closing it a
      // second time, underneath the leave transition.
      ev.preventDefault()

      if (!toValue(options.closeOnPressEscape)) {
        // Consume it: an overlay stacked underneath must not close out of sight.
        return true
      }

      closeIfAllowed('escape-key')

      return true
    },
  })

  function showDialog() {
    const dialog = dialogRef.value

    if (!dialog) {
      return
    }

    const wasOpen = dialog.open

    if (!wasOpen) {
      dialog.showModal()
      // Anything that has to paint above the dialog (toasts) must live inside it: the top layer
      // paints above every `z-index` on the page.
      pushTopLayer(dialog)
    }

    void nextTick(() => {
      if (!wasOpen) {
        focusInitialElement()
      }

      // The trap only exists once the dialog is open: `showModal()` focuses the first tabbable
      // element, and a sentinel sitting there would steal the initial focus.
      mountSentinels()
    })
  }

  function closeDialog() {
    const dialog = dialogRef.value

    if (dialog?.open) {
      dialog.close()
    }
  }

  function focusInitialElement() {
    const dialog = dialogRef.value
    const initialFocus = toValue(options.initialFocus)

    if (!dialog || !isTruthyProp(initialFocus)) {
      return
    }

    const selector = typeof initialFocus === 'string' ? initialFocus : FOCUSABLE_SELECTOR

    ;(dialog.querySelector<HTMLElement>(selector) ?? dialog).focus({ preventScroll: true })
  }

  function createSentinel(side: 'start' | 'end') {
    const sentinel = document.createElement('div')

    sentinel.tabIndex = 0
    sentinel.className = 'pxd-dialog--sentinel fixed opacity-0 pointer-events-none'
    sentinel.dataset.dialogSentinel = side
    sentinel.setAttribute('aria-hidden', 'true')
    sentinel.addEventListener('focus', () => onSentinelFocus(side))

    return sentinel
  }

  function mountSentinels() {
    const dialog = dialogRef.value

    if (!dialog || startSentinel || !dialog.open) {
      return
    }

    startSentinel = createSentinel('start')
    endSentinel = createSentinel('end')
    dialog.prepend(startSentinel)
    dialog.append(endSentinel)
  }

  function removeSentinels() {
    startSentinel?.remove()
    endSentinel?.remove()
    startSentinel = undefined
    endSentinel = undefined
  }

  function onSentinelFocus(side: 'start' | 'end') {
    const dialog = dialogRef.value

    if (!dialog) {
      return
    }

    const focusable = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)].filter(
      (element) => !element.hasAttribute('data-dialog-sentinel') && isShown(element),
    )
    const target = side === 'start' ? focusable.at(-1) : focusable[0]

    ;(target ?? dialog).focus({ preventScroll: true })
  }

  function onCancel(ev: Event) {
    // Back gestures and other native close requests take the same guarded path as Escape.
    ev.preventDefault()

    if (toValue(options.closeOnPressEscape)) {
      closeIfAllowed('escape-key', ev)
    }
  }

  function onNativeClose() {
    // The native event also fires for our own `close()`, and it is the only place that knows the
    // element left the top layer, so the stack has to be updated here rather than after the leave.
    const dialog = dialogRef.value

    // Our own `close()` runs after the leave transition, once the bound value is already false.
    if (!toValue(options.visible)) {
      if (dialog) {
        removeTopLayer(dialog)
      }

      return
    }

    // A programmatic `dialog.close()` has no cancelable event. If the close is not allowed, the
    // only way back is to open the dialog again; the paths that do expose an event are intercepted
    // before they get here.
    if (closeIfAllowed('close-press') === false) {
      showDialog()

      return
    }

    if (dialog) {
      removeTopLayer(dialog)
    }
  }

  function onDialogSubmit(ev: SubmitEvent) {
    const form = ev.target

    if (ev.defaultPrevented || !(form instanceof HTMLFormElement)) {
      return
    }

    const method = (
      ev.submitter?.getAttribute('formmethod') ??
      form.getAttribute('method') ??
      ''
    ).toLowerCase()

    if (method !== 'dialog') {
      return
    }

    // The submit is cancelable, so the dialog can stay open instead of closing under the leave
    // transition and, when the close is refused, leaving the bound value behind.
    ev.preventDefault()
    closeIfAllowed('close-press', ev)
  }

  function onDialogPointerDown(ev: PointerEvent) {
    // Only the primary button on the backdrop counts; a right or middle press is not a dismissal.
    if (ev.button !== 0 || ev.isPrimary === false) {
      return
    }

    // The dialog box is the empty area around the panel, so a press landing on it is a backdrop press.
    if (ev.target !== dialogRef.value) {
      return
    }

    options.onOutsidePress?.(ev)

    if (toValue(options.closeOnOutsideClick)) {
      closeIfAllowed('outside-press', ev)
    }
  }

  function onAfterLeave() {
    isClosing.value = false
    closeDialog()
  }

  watch(dialogRef, (dialog) => {
    if (dialog && toValue(options.visible)) {
      showDialog()
    }
  })

  watch(
    () => toValue(options.visible),
    (visible) => {
      if (visible) {
        isClosing.value = false
        showDialog()

        return
      }

      isClosing.value = true
      removeSentinels()
    },
  )

  onMounted(() => {
    if (toValue(options.visible)) {
      showDialog()
    }
  })

  onScopeDispose(() => {
    const dialog = dialogRef.value

    if (dialog) {
      removeTopLayer(dialog)
    }
  })

  return {
    dialogRef,
    setDialogRef,
    isClosing,
    closeIfAllowed,
    onCancel,
    onNativeClose,
    onDialogPointerDown,
    onDialogSubmit,
    onAfterLeave,
  }
}

function isShown(element: HTMLElement) {
  const view = element as HTMLElement & { checkVisibility?: () => boolean }

  if (typeof view.checkVisibility === 'function') {
    return view.checkVisibility()
  }

  const style = getComputedStyle(element)

  return style.display !== 'none' && style.visibility !== 'hidden'
}
