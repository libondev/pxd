import { shallowRef } from 'vue'

const openDialogs: HTMLDialogElement[] = []
const topLayerTarget = shallowRef<string | HTMLElement>('body')

/** Where a layer has to render to sit above the dialogs: the last one opened, or `body`. */
export function useTopLayerTarget() {
  return topLayerTarget
}

export function pushTopLayer(dialog: HTMLDialogElement) {
  removeTopLayer(dialog)
  openDialogs.push(dialog)
  topLayerTarget.value = dialog
}

export function removeTopLayer(dialog: HTMLElement) {
  const index = openDialogs.indexOf(dialog as HTMLDialogElement)

  if (index !== -1) {
    openDialogs.splice(index, 1)
  }

  topLayerTarget.value = openDialogs.at(-1) ?? 'body'
}

/** Position of an open dialog in the top-layer stack; `-1` when it is not tracked. */
export function getDialogLevel(dialog?: Element | null) {
  return dialog ? openDialogs.indexOf(dialog as HTMLDialogElement) : -1
}

/**
 * Level of a layer teleported into `target`: half a step above the dialog that owns it, so a
 * popover inside a dialog closes before the dialog, while a dialog opened later still wins.
 */
export function getNestedLevel(target?: Element | string | null) {
  const element = typeof target === 'string' ? document.querySelector(target) : target
  const dialog = element?.closest('dialog')

  if (!dialog) {
    return -1
  }

  const index = openDialogs.indexOf(dialog as HTMLDialogElement)

  return index === -1 ? -1 : index + 0.5
}
