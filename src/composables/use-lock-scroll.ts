import { onScopeDispose } from 'vue'
import { hasScrollbar, isScrollable } from '../utils/dom'
import { cachedOff, cachedOn, preventDefaultScroll } from '../utils/event'

let rootTouchMoveLocks = 0

export function useLockScroll() {
  const classList = ['pointer-events-none']

  function isLocked() {
    return rootTouchMoveLocks > 0
  }

  function lockScroll() {
    if (!isLocked()) {
      const rootEl = document.documentElement
      cachedOn(document, 'touchmove', preventDefaultScroll, { passive: false })

      const { x: xScrollbar, y: yScrollbar } = hasScrollbar(rootEl)
      const { x: xScrollable, y: yScrollable } = isScrollable(rootEl)

      if ((xScrollbar && xScrollable) || (yScrollbar && yScrollable)) {
        classList.push('scrollbar-gutter-stable', 'scrollbar-disabled')
      }

      rootEl.classList.add(...classList)
    }

    rootTouchMoveLocks++
  }

  function unlockScroll() {
    if (rootTouchMoveLocks <= 0) {
      return
    }

    rootTouchMoveLocks = Math.max(rootTouchMoveLocks - 1, 0)

    if (!rootTouchMoveLocks) {
      cachedOff(document, 'touchmove', preventDefaultScroll)
      document.documentElement.classList.remove(...classList)
    }
  }

  onScopeDispose(() => {
    unlockScroll()
  })

  return {
    isLocked,
    lockScroll,
    unlockScroll,
  }
}
