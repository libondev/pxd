import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, onMounted, onScopeDispose, shallowRef, watch } from 'vue'
import { getStyle } from '../../utils/dom.js'
import { toValue } from '../../utils/helper.js'

export function useCollapseMotion(
  contentRef: Ref<HTMLElement | undefined>,
  expanded: MaybeRefOrGetter<boolean>,
) {
  // Stays true during leave so height can animate before `open` is removed.
  const detailsOpen = shallowRef(false)

  let ready = false
  let skipEnter = false
  let stopWait: (() => void) | undefined

  const isLeaving = computed(() => detailsOpen.value && !toValue(expanded))

  function skipEnterMotion() {
    skipEnter = true
  }

  function clearWait() {
    stopWait?.()
    stopWait = undefined
  }

  function finish() {
    clearWait()

    const el = contentRef.value
    if (el) {
      el.style.height = ''
      el.style.overflow = ''
    }

    if (!toValue(expanded)) {
      detailsOpen.value = false
    }
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
      finish()
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

  watch(
    () => toValue(expanded),
    (isExpanded) => {
      if (isExpanded) {
        detailsOpen.value = true
      }

      if (!ready) {
        detailsOpen.value = isExpanded
        return
      }

      if (isExpanded && skipEnter) {
        skipEnter = false
        return
      }

      animate(isExpanded)
    },
    { immediate: true, flush: 'post' },
  )

  onMounted(() => {
    ready = true
  })

  onScopeDispose(() => {
    clearWait()
  })

  return {
    detailsOpen,
    isLeaving,
    skipEnterMotion,
  }
}
