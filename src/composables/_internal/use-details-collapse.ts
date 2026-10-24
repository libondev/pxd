import type { MaybeRefOrGetter, Ref } from 'vue'
import { onScopeDispose, shallowRef, watch } from 'vue'
import { getStyle } from '../../utils/dom.js'
import { toValue } from '../../utils/helper.js'

export function useDetailsCollapse(
  contentRef: Ref<HTMLElement | undefined>,
  source: MaybeRefOrGetter<boolean>,
) {
  const isOpen = shallowRef(toValue(source))

  // Stays true during leave so the grid row can animate before `open` is removed.
  const detailsOpen = shallowRef(isOpen.value)

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

  function onToggleClick() {
    isOpen.value = !isOpen.value
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
      isOpen.value = value
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
