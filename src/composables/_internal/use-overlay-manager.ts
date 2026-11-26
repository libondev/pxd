import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose, toValue, watch } from 'vue'
import {
  cachedOff,
  cachedOn,
  isCompositionKeydown,
  preventDefaultScroll,
} from '../../utils/event.js'
import { isServer } from '../../utils/is.js'
import { useLockScroll } from './use-lock-scroll.js'

const touchMoveOptions = { passive: false }

interface OverlayManagerOptions {
  visible: MaybeRefOrGetter<boolean>
  /** Open dialog this layer sits in: a higher level handles Escape before a lower one. */
  level?: MaybeRefOrGetter<number | undefined>
  lockScrollOnVisible?: MaybeRefOrGetter<boolean | undefined>
  /** Return `false` to let the next overlay below handle the event. */
  onPressEscape?: (ev: KeyboardEvent) => boolean | void
  zIndex?: MaybeRefOrGetter<number | undefined>
}

interface OverlayManagerEntry {
  id: symbol
  level: OverlayManagerOptions['level']
  onPressEscape: OverlayManagerOptions['onPressEscape']
  zIndex: OverlayManagerOptions['zIndex']
}

let isKeydownListening = false
let rootInteractionLocks = 0
let addedPointerEventsNone = false
const overlayStack: OverlayManagerEntry[] = []

function getEntryLevel(entry: OverlayManagerEntry) {
  const value = Number(toValue(entry.level))

  return Number.isFinite(value) ? value : -1
}

function getEntryZIndex(entry: OverlayManagerEntry) {
  const value = Number(toValue(entry.zIndex))

  return Number.isFinite(value) ? value : 0
}

function getOverlaysFromTop() {
  return overlayStack
    .map((entry, index) => ({
      entry,
      index,
      level: getEntryLevel(entry),
      zIndex: getEntryZIndex(entry),
    }))
    .sort((a, b) => b.level - a.level || b.zIndex - a.zIndex || b.index - a.index)
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
      ev.preventDefault()

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

/** Joins the shared overlay stack while visible: Escape routing, z-order and the scroll lock. */
export function useOverlayManager(options: OverlayManagerOptions) {
  const { level, lockScrollOnVisible, onPressEscape, zIndex } = options
  const { lockScroll, unlockScroll } = useLockScroll(() => document.body, { walkAncestors: true })

  let isLockedScroll = false
  const overlayId = Symbol('pxd-overlay-id')

  function registerOverlay() {
    const shouldLockScroll = toValue(lockScrollOnVisible) ?? true

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
      level,
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
    () => toValue(options.visible),
    (visible) => {
      if (isServer()) {
        return
      }

      if (visible) {
        registerOverlay()

        return
      }

      unregisterOverlay()
    },
    { immediate: true },
  )

  onScopeDispose(() => {
    unregisterOverlay()
  })
}
