import { hasScrollbar, isScrollable } from '../utils/dom'
import { cachedOff, cachedOn, preventDefaultScroll } from '../utils/event'

let documentTouchMoveLocks = 0

export function useLockScroll() {
  const rootEl = document.documentElement

  function isLocked() {
    return documentTouchMoveLocks > 0
  }

  function lockScroll() {
    if (!isLocked()) {
      cachedOn(document, 'touchmove', preventDefaultScroll, { passive: false })

      const classList = ['pointer-events-none!']

      const { y: yScrollbar } = hasScrollbar(rootEl)
      const { y: yScrollable } = isScrollable(rootEl)

      if (yScrollbar) {
        classList.push('scrollbar-stable')
      }

      if (yScrollable) {
        classList.push('scrollbar-disabled')
      }

      rootEl.classList.add(...classList)
    }

    documentTouchMoveLocks++
  }

  function unlockScroll() {
    if (documentTouchMoveLocks <= 0) {
      return
    }

    documentTouchMoveLocks = Math.max(documentTouchMoveLocks - 1, 0)

    if (!documentTouchMoveLocks) {
      cachedOff(document, 'touchmove', preventDefaultScroll)
      rootEl.classList.remove('pointer-events-none!', 'scrollbar-stable', 'scrollbar-disabled')
    }
  }

  return {
    isLocked,
    lockScroll,
    unlockScroll,
  }
}
