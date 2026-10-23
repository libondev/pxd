import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { getStyle } from '../../utils/dom.js'
import { toValue } from '../../utils/helper.js'

export function useDetailsCollapse(
  contentRef: Ref<HTMLElement | undefined>,
  source: MaybeRefOrGetter<boolean>,
) {
  const isOpen = shallowRef(toValue(source))

  // Stays true during leave so height can animate before `open` is removed.
  const detailsOpen = shallowRef(isOpen.value)

  let skipEnter = false
  let stopWait: (() => void) | undefined

  const isLeaving = computed(() => detailsOpen.value && !isOpen.value)

  function clearWait() {
    stopWait?.()
    stopWait = undefined
  }

  function animate(isExpanded: boolean) {
    const el = contentRef.value
    if (!el) {
      return
    }

    clearWait()

    el.style.overflow = 'hidden'
    el.style.height = isExpanded ? '0' : `${el.scrollHeight}px`
    void el.offsetHeight
    el.style.height = isExpanded ? `${el.scrollHeight}px` : '0'

    const done = (event?: Event) => {
      if (event && ((event as TransitionEvent).propertyName !== 'height' || event.target !== el)) {
        return
      }

      clearWait()
      el.style.height = ''
      el.style.overflow = ''

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
      skipEnter = true
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

        if (skipEnter) {
          skipEnter = false
          return
        }
      }

      animate(open)
    },
    { flush: 'post' },
  )

  onScopeDispose(clearWait)

  return { isOpen, detailsOpen, isLeaving, onToggleClick, onDetailsToggle }
}
