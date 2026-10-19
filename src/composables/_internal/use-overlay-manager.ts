import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose } from 'vue'
import {
  cachedOff,
  cachedOn,
  isCompositionKeydown,
  preventDefaultScroll,
} from '../../utils/event.js'
import { toValue } from '../../utils/helper.js'

const touchMoveOptions = { passive: false }

interface OverlayManagerOptions {
  enabled?: MaybeRefOrGetter<boolean>
  lockScrollOnVisible?: MaybeRefOrGetter<boolean>
  lockScroll: () => void
  unlockScroll: () => void
  onPressEscape?: (ev: KeyboardEvent) => void
}

interface OverlayManagerEntry {
  id: symbol
  onPressEscape: OverlayManagerOptions['onPressEscape']
}

let isKeydownListening = false
let rootInteractionLocks = 0
let addedPointerEventsNone = false
const overlayStack: OverlayManagerEntry[] = []

function getTopOverlay() {
  return overlayStack.at(-1)
}

// The locked container is per overlay, but the inert root and the touchmove guard are process-wide.
function lockRootInteraction() {
  if (rootInteractionLocks++) {
    return
  }

  const rootEl = document.documentElement

  addedPointerEventsNone = !rootEl.classList.contains('pointer-events-none')
  rootEl.classList.add('pointer-events-none')
  cachedOn(document, 'touchmove', preventDefaultScroll, touchMoveOptions)
}

function unlockRootInteraction() {
  if (--rootInteractionLocks > 0) {
    return
  }

  cachedOff(document, 'touchmove', preventDefaultScroll, touchMoveOptions)

  if (addedPointerEventsNone) {
    document.documentElement.classList.remove('pointer-events-none')
    addedPointerEventsNone = false
  }
}

function onEscapeKeydown(ev: KeyboardEvent) {
  const entry = getTopOverlay()

  if (!entry || ev.defaultPrevented || ev.repeat || isCompositionKeydown(ev)) {
    return
  }

  const { ctrlKey, metaKey, altKey, shiftKey, key } = ev

  if (ctrlKey || metaKey || altKey || shiftKey || key !== 'Escape') {
    return
  }

  entry?.onPressEscape?.(ev)
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
  const { enabled, lockScrollOnVisible, lockScroll, unlockScroll, onPressEscape } = options

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
      lockRootInteraction()
      isLockedScroll = true
    }

    const idx = overlayStack.findIndex((item) => item.id === overlayId)

    if (idx !== -1) {
      overlayStack.splice(idx, 1)
    }

    overlayStack.push({
      id: overlayId,
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
      unlockRootInteraction()
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
