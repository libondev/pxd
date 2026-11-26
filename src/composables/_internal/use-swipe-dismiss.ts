import type { BasePosition } from '../../types/shared/props'
import type { MaybeElementRef } from '../../types/shared/utils'
import type { MaybeRefOrGetter } from 'vue'
import { computed, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { getElement } from '../../utils/dom.js'
import { caf, raf } from '../../utils/event.js'
import { useMotionReduced } from '../use-motion-reduce.js'
import { useSwipeGesture } from './use-swipe-gesture.js'

interface SwipeDismissOptions {
  position: MaybeRefOrGetter<BasePosition>
  visible?: MaybeRefOrGetter<boolean>
  enabled?: MaybeRefOrGetter<boolean>
  motionReduced?: MaybeRefOrGetter<boolean>
  onDismiss: (event: PointerEvent) => boolean | void
}

const HANDLE_SELECTOR = '[data-swipe-handle]'
const DRAG_ELASTICITY = 0.2
const DISMISS_DISTANCE_THRESHOLD = 0.4
const DISMISS_VELOCITY_THRESHOLD = 0.3
const RELEASE_VELOCITY_WINDOW = 100
const SPRING_STIFFNESS = 500
const SPRING_DAMPING = 26

/** Drags a sheet off its open edge from a handle, and reports a release that should dismiss it. */
export function useSwipeDismiss(
  target: MaybeElementRef<HTMLElement | undefined>,
  options: SwipeDismissOptions,
) {
  const dragging = shallowRef(false)
  const settling = shallowRef(false)
  const systemMotionReduced = useMotionReduced()
  const motionReduced = computed(
    () => systemMotionReduced.value || (toValue(options.motionReduced) ?? false),
  )
  let startOffset = 0
  let currentOffset = 0
  let dragSize = 0
  let lastFollowTime = 0
  let frameId = 0
  let springOffset = 0
  let springVelocity = 0
  let previousFrameTime = 0

  const axis = computed<'horizontal' | 'vertical'>(() => {
    const position = toValue(options.position)

    return position === 'left' || position === 'right' ? 'horizontal' : 'vertical'
  })

  const sign = computed(() => {
    const position = toValue(options.position)

    return position === 'bottom' || position === 'right' ? 1 : -1
  })

  function cancelSettle() {
    if (!frameId) {
      return
    }

    caf(frameId)
    frameId = 0
  }

  function writeOffset(offset: number) {
    currentOffset = offset

    getElement(target)?.style.setProperty('--swipe-offset', `${sign.value * offset}px`)
  }

  function clearOffset() {
    currentOffset = 0
    getElement(target)?.style.removeProperty('--swipe-offset')
  }

  function stopTracking() {
    cancelSettle()
    dragging.value = false
    settling.value = false
  }

  function reset() {
    stopTracking()
    startOffset = 0
    dragSize = 0
    lastFollowTime = 0
    clearOffset()
  }

  function readOffset(element: HTMLElement) {
    const value = Number.parseFloat(
      element.style.getPropertyValue('--swipe-offset') ||
        getComputedStyle(element).getPropertyValue('--swipe-offset'),
    )

    return Number.isFinite(value) ? sign.value * value : 0
  }

  function applyElasticity(offset: number) {
    if (offset < 0) {
      return Math.max(offset * DRAG_ELASTICITY, -dragSize)
    }

    if (offset <= dragSize) {
      return offset
    }

    return dragSize + (offset - dragSize) * DRAG_ELASTICITY
  }

  function settle(velocity = 0) {
    cancelSettle()

    const element = getElement(target)

    dragging.value = false

    if (!element) {
      settling.value = false
      return
    }

    springOffset = readOffset(element)
    springVelocity = Math.max(sign.value * velocity * 1000, 0)

    if (motionReduced.value) {
      settling.value = false
      clearOffset()
      return
    }

    if (!springOffset && !springVelocity) {
      settling.value = false
      clearOffset()
      return
    }

    settling.value = true
    previousFrameTime = performance.now()

    function tick(now: number) {
      frameId = 0

      if (motionReduced.value) {
        settling.value = false
        clearOffset()
        return
      }

      const elapsed = Math.min(Math.max((now - previousFrameTime) / 1000, 0.001), 0.032)

      previousFrameTime = now
      springVelocity +=
        (-SPRING_STIFFNESS * springOffset - SPRING_DAMPING * springVelocity) * elapsed
      springOffset += springVelocity * elapsed

      if (springOffset <= 0 && springVelocity < 0) {
        springOffset = 0
        springVelocity = 0
      }

      writeOffset(springOffset)

      if (Math.abs(springOffset) < 0.1 && Math.abs(springVelocity) < 1) {
        settling.value = false
        clearOffset()
        return
      }

      frameId = raf(tick)
    }

    frameId = raf(tick)
  }

  useSwipeGesture(target, {
    enabled: () => (toValue(options.enabled) ?? true) && (toValue(options.visible) ?? true),
    axis: () => axis.value,
    handleSelector: HANDLE_SELECTOR,
    onPointerDown: cancelSettle,
    onTap: () => {
      if (settling.value) {
        settle()
      }
    },
    onPress: ({ size }) => {
      const element = getElement(target)

      cancelSettle()
      dragging.value = true
      settling.value = false
      dragSize = size
      lastFollowTime = 0
      startOffset = element ? readOffset(element) : 0
      currentOffset = startOffset
    },
    onFollow: ({ displacement }) => {
      lastFollowTime = Date.now()
      writeOffset(applyElasticity(startOffset + sign.value * displacement))
    },
    onRelease: ({ axisLocked, displacement, velocity, event }) => {
      dragging.value = false

      if (event.type === 'pointercancel') {
        settle()
        return
      }

      const releaseVelocity = Date.now() - lastFollowTime <= RELEASE_VELOCITY_WINDOW ? velocity : 0
      const closingDisplacement = sign.value * displacement
      const dismissByDistance =
        closingDisplacement > 0 &&
        dragSize > 0 &&
        currentOffset / dragSize >= DISMISS_DISTANCE_THRESHOLD

      const dismissByVelocity =
        closingDisplacement > 0 && sign.value * releaseVelocity >= DISMISS_VELOCITY_THRESHOLD

      if (axisLocked && (dismissByDistance || dismissByVelocity)) {
        const accepted = options.onDismiss(event)

        if (accepted === false) {
          settle(releaseVelocity)
        }

        return
      }

      settle(axisLocked ? releaseVelocity : 0)
    },
  })

  watch(
    () => toValue(options.visible) ?? true,
    (visible) => {
      if (visible) {
        reset()
        return
      }

      stopTracking()
    },
  )

  watch(
    () => toValue(options.enabled) ?? true,
    (enabled) => {
      if (!enabled) {
        reset()
      }
    },
  )

  watch(() => toValue(options.position), reset)

  onScopeDispose(cancelSettle)

  return {
    dragging,
    settling,
  }
}
