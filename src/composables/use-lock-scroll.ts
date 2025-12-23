import { optimizedOff, optimizedOn, preventDefaultScroll } from '../utils/event'

let documentTouchMoveLocks = 0
const scrollLockCountsMap = new WeakMap<HTMLElement, number>()

export function useLockScroll() {
  function isLocked(container: HTMLElement) {
    return (scrollLockCountsMap.get(container) ?? 0) > 0
  }

  function lockScroll(container: HTMLElement) {
    const currentLocks = scrollLockCountsMap.get(container) ?? 0
    scrollLockCountsMap.set(container, currentLocks + 1)

    // Already locked by another overlay instance (same container)
    if (currentLocks > 0) {
      return
    }

    documentTouchMoveLocks++
    if (documentTouchMoveLocks === 1) {
      optimizedOn(document, 'touchmove', preventDefaultScroll, { passive: false })
    }
  }

  function unlockScroll(container: HTMLElement) {
    const currentLocks = scrollLockCountsMap.get(container) ?? 0

    if (!currentLocks) {
      return
    }

    const nextLocks = Math.max(currentLocks - 1, 0)
    if (nextLocks) {
      scrollLockCountsMap.set(container, nextLocks)
      return
    }

    scrollLockCountsMap.delete(container)

    documentTouchMoveLocks = Math.max(documentTouchMoveLocks - 1, 0)
    if (!documentTouchMoveLocks) {
      optimizedOff(document, 'touchmove', preventDefaultScroll)
    }
  }

  return {
    isLocked,
    lockScroll,
    unlockScroll,
  }
}
