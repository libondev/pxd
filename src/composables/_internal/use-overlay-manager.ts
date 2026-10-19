import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose, watch } from 'vue'
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
  /** Return `false` to let the next overlay below handle the event. */
  onPressEscape?: (ev: KeyboardEvent) => boolean | void
  zIndex?: MaybeRefOrGetter<number | undefined>
}

interface OverlayManagerEntry {
  id: symbol
  onPressEscape: OverlayManagerOptions['onPressEscape']
  zIndex: OverlayManagerOptions['zIndex']
}

let isKeydownListening = false
let rootInteractionLocks = 0
let addedPointerEventsNone = false
const overlayStack: OverlayManagerEntry[] = []

function getEntryZIndex(entry: OverlayManagerEntry) {
  const value = Number(toValue(entry.zIndex))

  return Number.isFinite(value) ? value : 0
}

function getTopOverlay() {
  let top: OverlayManagerEntry | undefined

  for (const entry of overlayStack) {
    if (!top || getEntryZIndex(entry) >= getEntryZIndex(top)) {
      top = entry
    }
  }

  return top
}

function getOverlaysFromTop() {
  return overlayStack
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => getEntryZIndex(b.entry) - getEntryZIndex(a.entry) || b.index - a.index)
    .map(({ entry }) => entry)
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
  if (!overlayStack.length || ev.defaultPrevented || ev.repeat || isCompositionKeydown(ev)) {
    return
  }

  const { ctrlKey, metaKey, altKey, shiftKey, key } = ev

  if (ctrlKey || metaKey || altKey || shiftKey || key !== 'Escape') {
    return
  }

  for (const entry of getOverlaysFromTop()) {
    if (entry.onPressEscape?.(ev) !== false) {
      return
    }
  }
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
  const { enabled, lockScrollOnVisible, lockScroll, unlockScroll, onPressEscape, zIndex } =
    options

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
      zIndex,
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

  watch(
    () => toValue(enabled),
    (isEnabled, wasEnabled) => {
      if (isEnabled === wasEnabled) {
        return
      }

      if (isEnabled) {
        registerOverlay()
        return
      }

      unregisterOverlay()
    },
  )

  onScopeDispose(() => {
    unregisterOverlay()
  })

  return {
    isTopOverlay,
    registerOverlay,
    unregisterOverlay,
  }
}
