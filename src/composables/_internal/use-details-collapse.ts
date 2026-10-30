import type { MaybeRefOrGetter, Ref } from 'vue'
import { nextTick, onScopeDispose, shallowRef, watch } from 'vue'
import { getStyle } from '../../utils/dom.js'
import { toValue } from '../../utils/helper.js'

export function useDetailsCollapse(
  contentRef: Ref<HTMLElement | undefined>,
  source: MaybeRefOrGetter<boolean>,
) {
  const isOpen = shallowRef(toValue(source))

  // Stays true during leave so the grid row can animate before `open` is removed.
  const detailsOpen = shallowRef(isOpen.value)

  let pendingEnter = false
  let stopWait: (() => void) | undefined

  function clearWait() {
    stopWait?.()
    stopWait = undefined
  }

  function waitForLeaveEnd() {
    const el = contentRef.value
    if (!el) {
      detailsOpen.value = false
      return
    }

    clearWait()

    const done = (event?: Event) => {
      if (
        event &&
        ((event as TransitionEvent).propertyName !== 'grid-template-rows' || event.target !== el)
      ) {
        return
      }

      clearWait()

      if (!isOpen.value) {
        detailsOpen.value = false
      }
    }

    const ms = (Number.parseFloat(getStyle(el).transitionDuration) || 0) * 1000

    if (!ms) {
      done()
      return
    }

    el.addEventListener('transitionend', done)
    const timer = window.setTimeout(done, ms + 50)
    stopWait = () => {
      el.removeEventListener('transitionend', done)
      window.clearTimeout(timer)
    }
  }

  function enter() {
    pendingEnter = true
    detailsOpen.value = true

    // A closed details renders no content, so `open` must be laid out at 0fr before the row flips.
    void nextTick(() => {
      if (!pendingEnter) {
        return
      }

      pendingEnter = false
      void contentRef.value?.offsetHeight
      isOpen.value = true
    })
  }

  function leave() {
    pendingEnter = false
    isOpen.value = false
  }

  function onToggleClick() {
    if (isOpen.value) {
      leave()
    } else {
      enter()
    }
  }

  function onDetailsToggle(ev: Event) {
    const details = ev.currentTarget as HTMLDetailsElement

    if (details.open && !isOpen.value) {
      isOpen.value = true
    }
  }

  watch(
    () => toValue(source),
    (value) => {
      if (value) {
        enter()
      } else {
        leave()
      }
    },
  )

  watch(
    () => isOpen.value,
    (open) => {
      if (open) {
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
