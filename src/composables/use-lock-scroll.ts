import { cachedOff, cachedOn, preventDefaultScroll } from '../utils/event'

let documentTouchMoveLocks = 0

export function useLockScroll() {
  const rootEl = document.documentElement

  function isLocked() {
    return documentTouchMoveLocks > 0
  }

  function lockScroll() {
    // Already locked by another overlay instance (same container)
    if (documentTouchMoveLocks > 0) {
      return
    }

    documentTouchMoveLocks++

    if (documentTouchMoveLocks === 1) {
      cachedOn(document, 'touchmove', preventDefaultScroll, { passive: false })
      rootEl.classList.add('scrollbar-stable!', 'overflow-hidden!', 'pointer-events-none!')
    }
  }

  function unlockScroll() {
    if (documentTouchMoveLocks <= 0) {
      return
    }

    documentTouchMoveLocks = Math.max(documentTouchMoveLocks - 1, 0)

    if (!documentTouchMoveLocks) {
      cachedOff(document, 'touchmove', preventDefaultScroll)
      rootEl.classList.remove('scrollbar-stable!', 'overflow-hidden!', 'pointer-events-none!')
    }
  }

  return {
    isLocked,
    lockScroll,
    unlockScroll,
  }
}
