import type { TourStep } from '../../components/tour/types'
import type { MaybeRefOrGetter } from 'vue'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { getElement, getStyle, resolveScrollBehavior } from '../../utils/dom.js'
import { cachedOff, cachedOn, scheduleByRaf } from '../../utils/event.js'
import { toValue } from '../../utils/helper.js'
import { isServer } from '../../utils/is.js'

export interface TourRect {
  top: number
  left: number
  width: number
  height: number
}

export interface UseTourTargetOptions {
  step: MaybeRefOrGetter<TourStep | undefined>
  motionReduced: MaybeRefOrGetter<boolean>
  onMissingTarget: (index: number) => void
  onError: (error: unknown, index: number) => void
  onResolved: () => void
}

const ZERO_RECT: TourRect = { top: 0, left: 0, width: 0, height: 0 }

/**
 * Resolves the rect of the current step target and keeps it in sync with scroll,
 * resize and target size changes. `beforeEnter` runs before the target is
 * resolved, and the scroll into view happens once the element is known.
 */
export function useTourTarget(options: UseTourTargetOptions) {
  const { step, motionReduced, onMissingTarget, onError, onResolved } = options

  const rect = shallowRef<TourRect>(ZERO_RECT)
  const targetRadius = shallowRef('')
  const hasTarget = shallowRef(false)
  const isLoading = shallowRef(false)

  let targetEl: HTMLElement | null = null
  let token = 0
  let resizeObserver: ResizeObserver | null = null
  let isListening = false

  const scheduleUpdate = scheduleByRaf(measure)

  const isCentered = computed(() => !hasTarget.value)

  function measure() {
    if (!targetEl) {
      return
    }

    const { top, left, width, height } = targetEl.getBoundingClientRect()

    rect.value = { top, left, width, height }
    targetRadius.value = getStyle(targetEl).borderRadius
  }

  function observeTarget(el: HTMLElement | null) {
    resizeObserver?.disconnect()
    resizeObserver = null

    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }

    resizeObserver = new ResizeObserver(scheduleUpdate)
    resizeObserver.observe(el)
  }

  function startListening() {
    if (isListening || isServer()) {
      return
    }

    cachedOn(window, 'resize', scheduleUpdate)
    cachedOn(window, 'scroll', scheduleUpdate, { capture: true })
    isListening = true
  }

  function stopListening() {
    if (!isListening || isServer()) {
      return
    }

    cachedOff(window, 'resize', scheduleUpdate)
    cachedOff(window, 'scroll', scheduleUpdate, { capture: true })
    isListening = false
  }

  function detach() {
    stopListening()
    scheduleUpdate.cancel()
    observeTarget(null)
    targetEl = null
    targetRadius.value = ''
    hasTarget.value = false
    rect.value = ZERO_RECT
  }

  function center() {
    observeTarget(null)
    stopListening()
    targetEl = null
    targetRadius.value = ''
    hasTarget.value = false
    rect.value = ZERO_RECT
  }

  /**
   * Points the highlight at the element currently registered for the step.
   * A step without a target collapses to a zero-size frame at the viewport
   * centre, which reads as a full-screen intro panel.
   */
  function attachTarget(el: HTMLElement | null, currentToken: number) {
    if (currentToken !== token) {
      return
    }

    if (!el) {
      center()
      onResolved()

      return
    }

    targetEl = el
    hasTarget.value = true
    measure()
    observeTarget(el)
    startListening()
    onResolved()
  }

  async function goTo(index: number) {
    const currentToken = ++token
    const currentStep = toValue(step)

    isLoading.value = true

    if (currentStep?.beforeEnter) {
      try {
        await currentStep.beforeEnter({ index, step: currentStep })
      } catch (error) {
        if (currentToken !== token) {
          return
        }

        isLoading.value = false
        onError(error, index)

        return
      }
    }

    if (currentToken !== token) {
      return
    }

    isLoading.value = false

    if (!currentStep?.target) {
      attachTarget(null, currentToken)

      return
    }

    const el = getElement(currentStep.target) as HTMLElement | null

    if (!el) {
      onMissingTarget(index)

      return
    }

    attachTarget(el, currentToken)

    el.scrollIntoView({
      block: 'center',
      behavior: resolveScrollBehavior('auto', motionReduced),
    })

    // The smooth scroll settles after this frame; re-measure on the next one so
    // the highlight lands on the final position instead of the pre-scroll one.
    scheduleUpdate()
  }

  onMounted(() => {
    if (isServer()) {
      return
    }

    startListening()
  })

  onBeforeUnmount(() => {
    token++
    detach()
  })

  return {
    rect,
    targetRadius,
    hasTarget,
    isCentered,
    isLoading,
    goTo,
  }
}
