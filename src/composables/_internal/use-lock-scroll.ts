import type { MaybeElementRef } from '../../types/shared/utils'
import { onScopeDispose } from 'vue'
import { getElement, hasScrollbar, isScrollable } from '../../utils/dom.js'
import { cachedOff, cachedOn, preventDefaultScroll } from '../../utils/event.js'

const rootLockClassNames = ['pointer-events-none']
const touchMoveOptions = { passive: false }

interface ElementLock {
  count: number
  prevStyles: [property: string, value: string, priority: string][]
}

const elementLocks = new WeakMap<HTMLElement, ElementLock>()

let rootTouchMoveLocks = 0
let rootAddedClassNames: string[] = []

function lockElementScroll(el: HTMLElement): boolean {
  const lock = elementLocks.get(el)

  if (lock) {
    lock.count++
    return true
  }

  const { x: xScrollable, y: yScrollable } = isScrollable(el)

  if (!xScrollable && !yScrollable) {
    return false
  }

  // `hidden` (unlike `clip`) keeps the element a scroll container, so its scroll offset survives.
  const styles: Record<string, string> = { 'overflow-x': 'hidden', 'overflow-y': 'hidden' }
  const { x: xScrollbar, y: yScrollbar } = hasScrollbar(el)

  if ((xScrollbar && xScrollable) || (yScrollbar && yScrollable)) {
    styles['scrollbar-gutter'] = 'stable'
  }

  const prevStyles = Object.keys(styles).map((property): ElementLock['prevStyles'][number] => [
    property,
    el.style.getPropertyValue(property),
    el.style.getPropertyPriority(property),
  ])

  for (const [property, value] of Object.entries(styles)) {
    el.style.setProperty(property, value, 'important')
  }

  elementLocks.set(el, { count: 1, prevStyles })

  return true
}

function unlockElementScroll(el: HTMLElement) {
  const lock = elementLocks.get(el)

  if (!lock || --lock.count > 0) {
    return
  }

  for (const [property, value, priority] of lock.prevStyles) {
    if (value) {
      el.style.setProperty(property, value, priority)
    } else {
      el.style.removeProperty(property)
    }
  }

  elementLocks.delete(el)
}

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

/** Locks the root scroll, or only `target`'s own scroll when it is given. */
export function useLockScroll(target?: MaybeElementRef) {
  const isElementMode = target !== undefined
  const lockedElements: HTMLElement[] = []
  let instanceTouchMoveLocks = 0

  function isLocked() {
    if (isElementMode) {
      const el = getElement(target)

      return !!el && elementLocks.has(el)
    }

    return rootTouchMoveLocks > 0
  }

  function lockScroll() {
    if (isElementMode) {
      const el = getElement(target)

      if (el && lockElementScroll(el)) {
        lockedElements.push(el)
      }

      return
    }

    if (rootTouchMoveLocks === 0) {
      lockRootScroll()
    }

    rootTouchMoveLocks++
    instanceTouchMoveLocks++
  }

  function unlockScroll() {
    if (isElementMode) {
      const el = lockedElements.pop()

      if (el) {
        unlockElementScroll(el)
      }

      return
    }

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
    while (instanceTouchMoveLocks > 0 || lockedElements.length > 0) {
      unlockScroll()
    }
  })

  return {
    isLocked,
    lockScroll,
    unlockScroll,
  }
}
