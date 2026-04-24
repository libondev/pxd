import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose } from 'vue'
import { cachedOff, cachedOn } from '../utils/event'
import { toValue } from '../utils/ref'

interface OverlayManagerOptions {
  enabled?: MaybeRefOrGetter<boolean>
  closeOnPressEscape?: MaybeRefOrGetter<boolean>
  lockScrollOnVisible?: MaybeRefOrGetter<boolean>
  lockScroll: () => void
  unlockScroll: () => void
  onPressEscape?: (ev: KeyboardEvent) => void
}

interface OverlayManagerEntry {
  id: symbol
  closeOnPressEscape: OverlayManagerOptions['closeOnPressEscape']
  onPressEscape: OverlayManagerOptions['onPressEscape']
}

let isKeydownListening = false
const overlayStack: OverlayManagerEntry[] = []

function getTopOverlay() {
  return overlayStack.at(-1)
}

function onEscapeKeydown(ev: KeyboardEvent) {
  const entry = getTopOverlay()

  if (!entry) {
    return
  }

  const { ctrlKey, metaKey, altKey, shiftKey, key } = ev
  const { closeOnPressEscape, onPressEscape } = entry

  if (ctrlKey || metaKey || altKey || shiftKey || key !== 'Escape') {
    return
  }

  if (!closeOnPressEscape) {
    return
  }

  onPressEscape?.(ev)
}

function ensureKeydownListener() {
  if (isKeydownListening) {
    return
  }

  cachedOn(document, 'keydown', onEscapeKeydown)
  isKeydownListening = true
}

function removeKeydownListener() {
  if (!isKeydownListening || overlayStack.length > 0) {
    return
  }

  cachedOff(document, 'keydown', onEscapeKeydown)
  isKeydownListening = false
}

export function useOverlayManager(options: OverlayManagerOptions) {
  const {
    enabled,
    closeOnPressEscape,
    lockScrollOnVisible,
    lockScroll,
    unlockScroll,
    onPressEscape,
  } = options

  let isLockedScroll = false
  const overlayId = Symbol('pxd-overlay-id')

  function isTopOverlay(entry?: OverlayManagerEntry) {
    entry ??= getTopOverlay()

    return entry?.id === overlayId
  }

  function registerOverlay() {
    if (!toValue(enabled)) {
      return
    }

    const shouldLockScroll = toValue(lockScrollOnVisible)

    if (shouldLockScroll && !isLockedScroll) {
      lockScroll()
      isLockedScroll = true
    }

    const idx = overlayStack.findIndex((item) => item.id === overlayId)

    if (idx !== -1) {
      overlayStack.splice(idx, 1)
    }

    overlayStack.push({
      id: overlayId,
      closeOnPressEscape,
      onPressEscape,
    })

    ensureKeydownListener()
  }

  function unregisterOverlay() {
    const idx = overlayStack.findIndex((item) => item.id === overlayId)

    if (idx !== -1) {
      overlayStack.splice(idx, 1)
    }

    if (isLockedScroll) {
      unlockScroll()
      isLockedScroll = false
    }

    removeKeydownListener()
  }

  onScopeDispose(() => {
    unregisterOverlay()
  })

  return {
    isTopOverlay,
    registerOverlay,
    unregisterOverlay,
  }
}
