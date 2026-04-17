import type { MaybeRefOrGetter } from 'vue'
import { onBeforeUnmount, watch } from 'vue'
import { cachedOff, cachedOn } from '../utils/event'
import { isServer } from '../utils/is'
import { toValue } from '../utils/ref'

export type OverlayManagerCloseReason = 'press-escape' | 'pointer-down-outside' | 'click-outside'

export interface UseOverlayManagerOptions extends Omit<OverlayManagerEntry, 'id'> {
  enabled?: boolean
}

export function useOverlayManager(options: MaybeRefOrGetter<UseOverlayManagerOptions>) {
  const overlayId = Symbol('pxd-overlay-manager')

  const unwatch = watch(
    () => toValue(options),
    (value, _, onCleanup) => {
      if (isServer()) {
        return
      }

      if (!toValue(value.enabled ?? true)) {
        return
      }

      const unregister = registerOverlay({
        ...value,
        id: overlayId,
      })

      onCleanup(() => {
        unregister()
      })
    },
    { immediate: true, flush: 'post' },
  )

  function stop() {
    unwatch()
    removeOverlay(overlayId)
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    overlayId,
    stop,
    isTopOverlay: () => isTopOverlay(overlayId),
    dispatchClickOutside: (ev: PointerEvent) => dispatchOverlayClickOutside(overlayId, ev),
    dispatchPointerDownOutside: (ev: PointerEvent) =>
      dispatchOverlayPointerDownOutside(overlayId, ev),
  }
}

type OverlayManagerBoolean = boolean | (() => boolean)

type OverlayManagerEvent = KeyboardEvent | PointerEvent | PointerEvent

interface OverlayManagerEntry {
  id: symbol
  isActive?: OverlayManagerBoolean
  closeOnPressEscape?: OverlayManagerBoolean
  closeOnClickOutside?: OverlayManagerBoolean
  closeOnPointerDownOutside?: OverlayManagerBoolean
  onPressEscape?: (ev: KeyboardEvent) => void
  onClickOutside?: (ev: PointerEvent) => void
  onPointerDownOutside?: (ev: PointerEvent) => void
  onClose?: (reason: OverlayManagerCloseReason, ev: OverlayManagerEvent) => void
}

const overlayStack: OverlayManagerEntry[] = []

function resolveBoolean(value: OverlayManagerBoolean | undefined, defaultValue: boolean = false) {
  if (typeof value === 'function') {
    return value()
  }

  return value ?? defaultValue
}

function getTopOverlay() {
  for (let index = overlayStack.length - 1; index >= 0; index--) {
    const entry = overlayStack[index]

    if (entry && resolveBoolean(entry.isActive, true)) {
      return entry
    }
  }

  return null
}

function syncGlobalListeners() {
  if (isServer()) {
    return
  }

  if (overlayStack.length) {
    cachedOn(document, 'keydown', onDocumentKeydown)
    return
  }

  cachedOff(document, 'keydown', onDocumentKeydown)
}

function closeIfNeeded(
  entry: OverlayManagerEntry,
  shouldClose: OverlayManagerBoolean | undefined,
  reason: OverlayManagerCloseReason,
  ev: OverlayManagerEvent,
) {
  if (ev.defaultPrevented) {
    return false
  }

  if (!resolveBoolean(shouldClose)) {
    return false
  }

  entry.onClose?.(reason, ev)
  return true
}

function onDocumentKeydown(ev: KeyboardEvent) {
  const entry = getTopOverlay()

  if (!entry) {
    return
  }

  if (ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey) {
    return
  }

  if (ev.key !== 'Escape') {
    return
  }

  if (!resolveBoolean(entry.closeOnPressEscape)) {
    return
  }

  entry.onPressEscape?.(ev)
  closeIfNeeded(entry, true, 'press-escape', ev)
}

function registerOverlay(entry: OverlayManagerEntry) {
  const idx = overlayStack.findIndex((item) => item.id === entry.id)

  if (idx !== -1) {
    overlayStack.splice(idx, 1)
  }

  overlayStack.push(entry)
  syncGlobalListeners()

  return () => removeOverlay(entry.id)
}

function removeOverlay(id: symbol) {
  const idx = overlayStack.findIndex((item) => item.id === id)

  if (idx !== -1) {
    overlayStack.splice(idx, 1)
  }

  syncGlobalListeners()
}

function isTopOverlay(id: symbol) {
  return getTopOverlay()?.id === id
}

function dispatchOverlayClickOutside(id: symbol, ev: PointerEvent) {
  const entry = getTopOverlay()

  if (!entry || entry.id !== id) {
    return false
  }

  entry.onClickOutside?.(ev)
  return closeIfNeeded(entry, entry.closeOnClickOutside, 'click-outside', ev)
}

function dispatchOverlayPointerDownOutside(id: symbol, ev: PointerEvent) {
  const entry = getTopOverlay()

  if (!entry || entry.id !== id) {
    return false
  }

  entry.onPointerDownOutside?.(ev)
  return closeIfNeeded(entry, entry.closeOnPointerDownOutside, 'pointer-down-outside', ev)
}
