import { onScopeDispose } from 'vue'
import { hasScrollbar, isScrollable } from '../utils/dom'
import { cachedOff, cachedOn, preventDefaultScroll } from '../utils/event'

const rootLockClassNames = ['pointer-events-none']
const touchMoveOptions = { passive: false }

let rootTouchMoveLocks = 0
let rootAddedClassNames: string[] = []

function lockRootScroll() {
  const rootEl = document.documentElement
  const classNames = [...rootLockClassNames]
  cachedOn(document, 'touchmove', preventDefaultScroll, touchMoveOptions)

  const { x: xScrollbar, y: yScrollbar } = hasScrollbar(rootEl)
  const { x: xScrollable, y: yScrollable } = isScrollable(rootEl)

  if ((xScrollbar && xScrollable) || (yScrollbar && yScrollable)) {
    classNames.push('scrollbar-gutter-stable', 'scrollbar-disabled')
  }

  rootAddedClassNames = classNames.filter((className) => !rootEl.classList.contains(className))
  rootEl.classList.add(...classNames)
}

function unlockRootScroll() {
  cachedOff(document, 'touchmove', preventDefaultScroll, touchMoveOptions)
  document.documentElement.classList.remove(...rootAddedClassNames)
  rootAddedClassNames = []
}

export function useLockScroll() {
  let instanceTouchMoveLocks = 0

  function isLocked() {
    return rootTouchMoveLocks > 0
  }

  function lockScroll() {
    if (rootTouchMoveLocks === 0) {
      lockRootScroll()
    }

    rootTouchMoveLocks++
    instanceTouchMoveLocks++
  }

  function unlockScroll() {
    if (instanceTouchMoveLocks <= 0) {
      return
    }

    instanceTouchMoveLocks--
    rootTouchMoveLocks--

    if (!rootTouchMoveLocks) {
      unlockRootScroll()
    }
  }

  onScopeDispose(() => {
    while (instanceTouchMoveLocks > 0) {
      unlockScroll()
    }
  })

  return {
    isLocked,
    lockScroll,
    unlockScroll,
  }
}
