import type { MaybeElementRef } from '../../types/shared/utils'
import { onScopeDispose } from 'vue'
import { getElement, hasScrollbar, isScrollable } from '../../utils/dom.js'

interface ElementLock {
  count: number
  classes: string[]
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
  const classes = ['scrollbar-disabled']

  // The gutter only reserves space for the block-axis scrollbar, an inline-axis one needs none.
  if (yScrollbar && yScrollable) {
    classes.push('scrollbar-gutter-stable!')
  }

  el.classList.add(...classes)

  elementLocks.set(el, { count: 1, classes })

  return true
}

function unlockElementScroll(el: HTMLElement) {
  const lock = elementLocks.get(el)

  if (!lock || --lock.count > 0) {
    return
  }

  el.classList.remove(...lock.classes)

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
