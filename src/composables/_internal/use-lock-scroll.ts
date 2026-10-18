import type { MaybeElementRef } from '../../types/shared/utils'
import { onScopeDispose } from 'vue'
import { getElement, hasScrollbar, isScrollable } from '../../utils/dom.js'

interface LockedStyle {
  property: string
  lockedValue: string
  prevValue: string
  prevPriority: string
}

interface ElementLock {
  count: number
  styles: LockedStyle[]
}

const elementLocks = new WeakMap<HTMLElement, ElementLock>()

function lockElementScroll(el: HTMLElement): boolean {
  const locked = elementLocks.get(el)

  if (locked) {
    locked.count++
    return true
  }

  const { x: xScrollable, y: yScrollable } = isScrollable(el)

  if (!xScrollable && !yScrollable) {
    return false
  }

  const { y: yScrollbar } = hasScrollbar(el)

  // `hidden` (unlike `clip`) keeps the element a scroll container, so its scroll offset survives.
  const styles: Record<string, string> = { 'overflow-x': 'hidden', 'overflow-y': 'hidden' }

  // The gutter only reserves space for the block-axis scrollbar, an inline-axis one needs none.
  if (yScrollbar && yScrollable) {
    styles['scrollbar-gutter'] = 'stable'
  }

  const lockedStyles = Object.entries(styles).map(([property, lockedValue]): LockedStyle => ({
    property,
    lockedValue,
    prevValue: el.style.getPropertyValue(property),
    prevPriority: el.style.getPropertyPriority(property),
  }))

  for (const { property, lockedValue } of lockedStyles) {
    el.style.setProperty(property, lockedValue, 'important')
  }

  elementLocks.set(el, { count: 1, styles: lockedStyles })

  return true
}

function unlockElementScroll(el: HTMLElement) {
  const lock = elementLocks.get(el)

  if (!lock || --lock.count > 0) {
    return
  }

  for (const { property, lockedValue, prevValue, prevPriority } of lock.styles) {
    // The value no longer belongs to this lock, restoring ours would drop the other change.
    if (el.style.getPropertyValue(property) !== lockedValue) {
      continue
    }

    if (prevValue) {
      el.style.setProperty(property, prevValue, prevPriority)
    } else {
      el.style.removeProperty(property)
    }
  }

  elementLocks.delete(el)
}

interface LockScrollOptions {
  /** Whether to keep looking up the ancestor chain when the anchor itself does not scroll. */
  walkAncestors?: boolean
}

/** Locks the scroll container that `target` sits in. */
export function useLockScroll(target: MaybeElementRef, options: LockScrollOptions = {}) {
  const { walkAncestors = false } = options
  const lockedElements: HTMLElement[] = []

  function isLocked() {
    return lockedElements.length > 0
  }

  function lockScroll() {
    // A container this module already locked still counts, even though it now reads `hidden`.
    for (let el = getElement(target); el; el = walkAncestors ? el.parentElement : null) {
      if (lockElementScroll(el)) {
        lockedElements.push(el)
        return
      }
    }
  }

  function unlockScroll() {
    const el = lockedElements.pop()

    if (el) {
      unlockElementScroll(el)
    }
  }

  onScopeDispose(() => {
    while (lockedElements.length > 0) {
      unlockScroll()
    }
  })

  return {
    isLocked,
    lockScroll,
    unlockScroll,
  }
}
