import { describe, expect, it, vi } from 'vite-plus/test'
import { ref } from 'vue'
import { useDialogLayer } from '../../src/composables/_internal/use-dialog-layer'
import { pointerEvent } from '../helpers/pointer'
import { useSetupWrapper } from '../helpers/setup'

function submitEvent(form: HTMLFormElement) {
  const preventDefault = vi.fn()
  const event = {
    defaultPrevented: false,
    preventDefault,
    submitter: null,
    target: form,
  } as unknown as SubmitEvent

  return { event, preventDefault }
}

function dialogForm(method: string) {
  const form = document.createElement('form')

  form.setAttribute('method', method)

  return form
}

describe('useDialogLayer', () => {
  it('should not close while loading', () => {
    const onClose = vi.fn()
    const { closeIfAllowed, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: false, loading: true, onClose }),
    )

    closeIfAllowed('close-press')

    expect(onClose).not.toHaveBeenCalled()
    expect(closeIfAllowed('close-press')).toBe(false)

    unmount()
  })

  it('should forward a swipe and the result of its close', () => {
    const onClose = vi.fn(() => false)
    const { closeIfAllowed, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, onClose }),
    )
    const event = new PointerEvent('pointerup')

    expect(closeIfAllowed('swipe', event)).toBe(false)
    expect(onClose).toHaveBeenCalledWith('swipe', event)

    unmount()
  })

  it('should forward outside presses and close when allowed', () => {
    const onClose = vi.fn()
    const onOutsidePress = vi.fn()
    const { dialogRef, onDialogPointerDown, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, closeOnClickOverlay: true, onClose, onOutsidePress }),
    )
    const dialog = document.createElement('dialog')

    dialogRef.value = dialog
    dialog.addEventListener('pointerdown', onDialogPointerDown)

    const event = pointerEvent('pointerdown')

    dialog.dispatchEvent(event)

    expect(onOutsidePress).toHaveBeenCalledWith(event)
    expect(onClose).toHaveBeenCalledWith('outside-press', event)

    unmount()
  })

  it('should not close on a non-primary button on the backdrop', () => {
    const onClose = vi.fn()
    const { dialogRef, onDialogPointerDown, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, closeOnClickOverlay: true, onClose }),
    )
    const dialog = document.createElement('dialog')

    dialogRef.value = dialog
    dialog.addEventListener('pointerdown', onDialogPointerDown)

    dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 2 }))
    dialog.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 1 }))

    expect(onClose).not.toHaveBeenCalled()

    unmount()
  })

  it('should ignore presses inside the panel', () => {
    const onClose = vi.fn()
    const { dialogRef, onDialogPointerDown, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, closeOnClickOverlay: true, onClose }),
    )
    const dialog = document.createElement('dialog')
    const panel = document.createElement('div')

    dialog.append(panel)
    dialogRef.value = dialog
    dialog.addEventListener('pointerdown', onDialogPointerDown)

    panel.dispatchEvent(pointerEvent('pointerdown'))

    expect(onClose).not.toHaveBeenCalled()

    unmount()
  })

  it('should mount the focus sentinels and wrap through them', async () => {
    const visible = ref(false)
    const { dialogRef, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible, onClose: vi.fn() }),
    )
    const dialog = document.createElement('dialog')
    const hidden = document.createElement('button')
    const first = document.createElement('button')
    const last = document.createElement('button')

    hidden.style.display = 'none'
    dialog.append(hidden, first, document.createElement('p'), last)
    document.body.append(dialog)
    dialogRef.value = dialog

    visible.value = true

    await vi.waitFor(() => expect(dialog.querySelectorAll('[data-dialog-sentinel]').length).toBe(2))

    const start = dialog.querySelector<HTMLElement>('[data-dialog-sentinel="start"]')!
    const end = dialog.querySelector<HTMLElement>('[data-dialog-sentinel="end"]')!

    expect(end.className).toContain('pxd-dialog--sentinel')

    end.focus()

    expect(document.activeElement).toBe(first)

    start.focus()

    expect(document.activeElement).toBe(last)

    visible.value = false

    await vi.waitFor(() => expect(dialog.querySelectorAll('[data-dialog-sentinel]').length).toBe(0))

    dialog.remove()
    unmount()
  })

  it('should follow a close it did not start', () => {
    const onClose = vi.fn()
    const { onNativeClose, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, onClose }),
    )

    onNativeClose()

    expect(onClose).toHaveBeenCalledWith('close-press')

    unmount()
  })

  it('should ignore the close it starts itself', () => {
    const onClose = vi.fn()
    const { onNativeClose, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: false, onClose }),
    )

    onNativeClose()

    expect(onClose).not.toHaveBeenCalled()

    unmount()
  })

  it('should route a dialog form submit through the guarded close', () => {
    const onClose = vi.fn()
    const { onDialogSubmit, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, onClose }),
    )
    const { event, preventDefault } = submitEvent(dialogForm('dialog'))

    onDialogSubmit(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalledWith('close-press', event)

    unmount()
  })

  it('should keep the dialog open when a dialog form submits while loading', () => {
    const onClose = vi.fn()
    const { onDialogSubmit, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, loading: true, onClose }),
    )
    const { event, preventDefault } = submitEvent(dialogForm('dialog'))

    onDialogSubmit(event)

    expect(preventDefault).toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    unmount()
  })

  it('should ignore forms that do not submit to the dialog', () => {
    const onClose = vi.fn()
    const { onDialogSubmit, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, onClose }),
    )
    const { event, preventDefault } = submitEvent(dialogForm('post'))

    onDialogSubmit(event)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    unmount()
  })

  it('should respect a submit that was already canceled', () => {
    const onClose = vi.fn()
    const { onDialogSubmit, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, onClose }),
    )
    const { event, preventDefault } = submitEvent(dialogForm('dialog'))

    Object.defineProperty(event, 'defaultPrevented', { value: true })
    onDialogSubmit(event)

    expect(preventDefault).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    unmount()
  })

  it('should reopen a dialog closed under it while loading', () => {
    const onClose = vi.fn()
    const { dialogRef, onNativeClose, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, loading: true, onClose }),
    )
    const dialog = document.createElement('dialog')

    document.body.append(dialog)
    dialogRef.value = dialog

    onNativeClose()

    expect(onClose).not.toHaveBeenCalled()
    expect(dialog.open).toBe(true)

    dialog.remove()
    unmount()
  })

  it('should reopen a dialog whose close the consumer canceled', () => {
    const onClose = vi.fn(() => false)
    const { dialogRef, onNativeClose, unmount } = useSetupWrapper(() =>
      useDialogLayer({ visible: true, onClose }),
    )
    const dialog = document.createElement('dialog')

    document.body.append(dialog)
    dialogRef.value = dialog

    onNativeClose()

    expect(onClose).toHaveBeenCalledWith('close-press')
    expect(dialog.open).toBe(true)

    dialog.remove()
    unmount()
  })
})
