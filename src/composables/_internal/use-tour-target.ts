import type { TourStep } from '../../components/tour/types'
import type { MaybeRefOrGetter } from 'vue'
import { computed, onBeforeUnmount, shallowRef } from 'vue'
import { getElement, getStyle, resolveScrollBehavior } from '../../utils/dom.js'
import { caf, cachedOff, cachedOn, raf, scheduleByRaf } from '../../utils/event.js'
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

function isSameRect(a: TourRect, b: TourRect) {
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height
}

/**
 * Resolves the rect of the current step target and keeps it in sync with scroll,
 * resize, target size and target position changes. `beforeEnter` runs before the
 * target is resolved, and the scroll into view happens once the element is known.
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
  let positionFrame = 0

  const scheduleUpdate = scheduleByRaf(measure)

  const isCentered = computed(() => !hasTarget.value)

  function centeredRect(): TourRect {
    if (isServer()) {
      return ZERO_RECT
    }

    return {
      top: window.innerHeight / 2,
      left: window.innerWidth / 2,
      width: 0,
      height: 0,
    }
  }

  function measure() {
    if (!targetEl) {
      const nextRect = centeredRect()

      if (!isSameRect(rect.value, nextRect)) {
        rect.value = nextRect
      }

      return
    }

    const { top, left, width, height } = targetEl.getBoundingClientRect()
    const nextRect = { top, left, width, height }

    if (!isSameRect(rect.value, nextRect)) {
      rect.value = nextRect
    }

    const radius = getStyle(targetEl).borderRadius

    if (radius !== targetRadius.value) {
      targetRadius.value = radius
    }
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

  function startPositionTracking() {
    if (isServer() || positionFrame) {
      return
    }

    positionFrame = raf(trackPosition)
  }

  function stopPositionTracking() {
    if (!positionFrame) {
      return
    }

    caf(positionFrame)
    positionFrame = 0
  }

  function trackPosition() {
    positionFrame = 0

    if (!targetEl) {
      return
    }

    const { top, left, width, height } = targetEl.getBoundingClientRect()
    const nextRect = { top, left, width, height }

    if (!isSameRect(rect.value, nextRect)) {
      rect.value = nextRect
      targetRadius.value = getStyle(targetEl).borderRadius
    }

    positionFrame = raf(trackPosition)
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
    stopPositionTracking()
    scheduleUpdate.cancel()
    observeTarget(null)
    targetEl = null
    targetRadius.value = ''
    hasTarget.value = false
    rect.value = ZERO_RECT
  }

  function center() {
    observeTarget(null)
    stopPositionTracking()
    targetEl = null
    targetRadius.value = ''
    hasTarget.value = false
    rect.value = centeredRect()
    startListening()
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
    startPositionTracking()
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

    try {
      const el = getElement(currentStep.target) as HTMLElement | null

      if (!el) {
        onMissingTarget(index)

        return
      }

      attachTarget(el, currentToken)

      if (currentToken !== token) {
        return
      }

      el.scrollIntoView({
        block: 'center',
        behavior: resolveScrollBehavior('auto', motionReduced),
      })

      // The smooth scroll settles after this frame; re-measure on the next one so
      // the highlight lands on the final position instead of the pre-scroll one.
      scheduleUpdate()
    } catch (error) {
      if (currentToken !== token) {
        return
      }

      isLoading.value = false
      onError(error, index)
    }
  }

  function cancel() {
    token++
    isLoading.value = false
    detach()
  }

  onBeforeUnmount(cancel)

  return {
    rect,
    targetRadius,
    hasTarget,
    isCentered,
    isLoading,
    goTo,
    cancel,
  }
}
