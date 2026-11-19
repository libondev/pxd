import type { MaybeElementRef } from '../types/shared/utils'
import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { nextTick, onScopeDispose, shallowRef, watch, toValue } from 'vue'
import { getStyle } from '../utils/dom.js'

export interface UseDetailsCollapseReturn {
  isOpen: ShallowRef<boolean>
  detailsOpen: ShallowRef<boolean>
  onToggleClick: () => void
  onDetailsToggle: (ev: Event) => void
}

export function useDetailsCollapse(
  content: MaybeElementRef<HTMLElement>,
  open: MaybeRefOrGetter<boolean>,
): UseDetailsCollapseReturn {
  const isOpen = shallowRef(toValue(open))

  // Stays true during leave so the grid row can animate before `open` is removed.
  const detailsOpen = shallowRef(isOpen.value)

  let pendingEnter = false
  let stopWait: (() => void) | undefined

  function clearWait() {
    stopWait?.()
    stopWait = undefined
  }

  function waitForLeaveEnd() {
    clearWait()

    const el = toValue(content)
    const ms = el ? (Number.parseFloat(getStyle(el).transitionDuration) || 0) * 1000 : 0

    if (!el || !ms) {
      detailsOpen.value = false
      return
    }

    const finish = () => {
      clearWait()
      detailsOpen.value = false
    }
    const onTransitionEnd = (ev: TransitionEvent) => {
      if (ev.target === el && ev.propertyName === 'grid-template-rows') {
        finish()
      }
    }

    el.addEventListener('transitionend', onTransitionEnd)
    const timer = window.setTimeout(finish, ms + 50)
    stopWait = () => {
      el.removeEventListener('transitionend', onTransitionEnd)
      window.clearTimeout(timer)
    }
  }

  function enter() {
    if (isOpen.value) {
      return
    }

    // Entering drops a leave in flight: its listener would close the reopened details.
    clearWait()
    pendingEnter = true
    detailsOpen.value = true

    // A closed details renders no content, so `open` must be laid out at 0fr before the row flips.
    void nextTick(() => {
      if (!pendingEnter) {
        return
      }

      pendingEnter = false
      void toValue(content)?.offsetHeight
      isOpen.value = true
    })
  }

  function leave() {
    pendingEnter = false
    isOpen.value = false
  }

  function setOpen(value: boolean) {
    if (value) {
      enter()
    } else {
      leave()
    }
  }

  function onToggleClick() {
    setOpen(!isOpen.value)
  }

  function onDetailsToggle(ev: Event) {
    if (!(ev.currentTarget as HTMLDetailsElement).open) {
      return
    }

    // The browser already laid the open content out, so this path has no first-frame gap to bridge.
    clearWait()
    detailsOpen.value = true
    isOpen.value = true
  }

  watch(
    () => toValue(open),
    (value) => setOpen(value),
  )

  watch(
    () => isOpen.value,
    (value) => {
      if (value) {
        detailsOpen.value = true
      } else {
        waitForLeaveEnd()
      }
    },
    { flush: 'post' },
  )

  onScopeDispose(clearWait)

  return { isOpen, detailsOpen, onToggleClick, onDetailsToggle }
}
