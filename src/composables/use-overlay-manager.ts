import type { MaybeRefOrGetter } from 'vue'
import { onBeforeUnmount, watch } from 'vue'
import { cachedOff, cachedOn } from '../utils/event'
import { isServer } from '../utils/is'
import { toValue } from '../utils/ref'

export type OverlayManagerCloseReason = 'press-escape' | 'outside-click'

type OverlayManagerBoolean = boolean | (() => boolean)

type OverlayManagerEvent = KeyboardEvent | PointerEvent

interface OverlayManagerEntry {
  id: symbol
  isActive?: OverlayManagerBoolean
  closeOnPressEscape?: OverlayManagerBoolean
  closeOnClickOutside?: OverlayManagerBoolean
  onPressEscape?: (ev: KeyboardEvent) => void
  onClickOutside?: (ev: PointerEvent) => void
  onClose?: (reason: OverlayManagerCloseReason, ev: OverlayManagerEvent) => void
}

export interface UseOverlayManagerOptions extends Omit<OverlayManagerEntry, 'id'> {
  enabled?: MaybeRefOrGetter<boolean>
}

interface OverlayManagerDeps {
  doc: Document | null
  isServer: () => boolean
  on: typeof cachedOn
  off: typeof cachedOff
}

export interface OverlayManagerApi {
  registerOverlay: (entry: OverlayManagerEntry) => () => void
  removeOverlay: (id: symbol) => void
  isTopOverlay: (id: symbol) => boolean
  dispatchOverlayClickOutside: (id: symbol, ev: PointerEvent) => boolean
  reset: () => void
}

const defaultOverlayManager = createOverlayManager()

export function useOverlayManager(
  options: MaybeRefOrGetter<UseOverlayManagerOptions>,
  manager: OverlayManagerApi = defaultOverlayManager,
) {
  const overlayId = Symbol('pxd-overlay-manager')

  const unwatch = watch(
    () => toValue(options),
    (newOptions, _, onCleanup) => {
      if (isServer()) {
        return
      }

      if (!toValue(newOptions.enabled ?? true)) {
        return
      }

      const unregister = manager.registerOverlay({
        ...newOptions,
        id: overlayId,
      })

      onCleanup(unregister)
    },
    { immediate: true, flush: 'post' },
  )

  function stop() {
    unwatch()
    manager.removeOverlay(overlayId)
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    overlayId,
    stop,
    isTopOverlay: () => manager.isTopOverlay(overlayId),
    dispatchClickOutside: (ev: PointerEvent) => manager.dispatchOverlayClickOutside(overlayId, ev),
  }
}

function resolveBoolean(value: OverlayManagerBoolean | undefined, defaultValue: boolean = false) {
  if (typeof value === 'function') {
    return value()
  }

  return value ?? defaultValue
}

function getTopActiveOverlay(overlayStack: OverlayManagerEntry[]) {
  for (let index = overlayStack.length - 1; index >= 0; index--) {
    const entry = overlayStack[index]

    if (entry && resolveBoolean(entry.isActive, true)) {
      return entry
    }
  }

  return null
}

function createOverlayManager(depsOverrides: Partial<OverlayManagerDeps> = {}): OverlayManagerApi {
  const deps: OverlayManagerDeps = {
    doc: typeof document === 'undefined' ? null : document,
    isServer,
    on: cachedOn,
    off: cachedOff,
    ...depsOverrides,
  }
  const overlayStack: OverlayManagerEntry[] = []
  let isKeydownListening = false

  function getTopOverlay() {
    return getTopActiveOverlay(overlayStack)
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

  function syncGlobalListeners() {
    if (deps.isServer() || !deps.doc) {
      return
    }

    const shouldListen = overlayStack.length > 0

    if (shouldListen === isKeydownListening) {
      return
    }

    if (shouldListen) {
      deps.on(deps.doc, 'keydown', onDocumentKeydown)
    } else {
      deps.off(deps.doc, 'keydown', onDocumentKeydown)
    }

    isKeydownListening = shouldListen
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
    return closeIfNeeded(entry, entry.closeOnClickOutside, 'outside-click', ev)
  }

  function reset() {
    overlayStack.length = 0
    syncGlobalListeners()
  }

  return {
    registerOverlay,
    removeOverlay,
    isTopOverlay,
    dispatchOverlayClickOutside,
    reset,
  }
}
