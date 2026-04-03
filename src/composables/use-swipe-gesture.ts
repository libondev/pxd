import type { MaybeElementRef } from '../types/shared'
import type { MaybeRefOrGetter } from 'vue'
import Core from '@any-touch/core'
import Pan from '@any-touch/pan'
import { onBeforeUnmount, watch } from 'vue'
import { toValue, unrefElement } from '../utils/ref'

export type SwipeDirection = 'left' | 'right' | 'top' | 'bottom'

export interface SwipePressState {
  size: number
}

export interface SwipeFollowState {
  /** Movement since the previous event along the active axis (px). */
  delta: number
  /** Velocity (px / ms) since the previous event along the active axis. */
  velocity: number
  /** `displacement / containerSize` — signed ratio, typically in the range of -1 to 1. */
  offset: number
  /** Signed displacement from the start point along the active axis (px). */
  displacement: number
}

export interface SwipeReleaseState {
  /** Whether the gesture qualified as a successful swipe (by velocity or distance). */
  swiped: boolean
  /** Physical swipe direction. `undefined` when `swiped` is `false`. */
  direction?: SwipeDirection
}

export interface SwipeGestureOptions {
  disabled?: MaybeRefOrGetter<boolean>
  /**
   * CSS selector for the drag handle element within the container.
   * When set, gesture events bind to this element instead of the container,
   * preventing interference with scrollable content inside the container.
   */
  handleSelector?: string
  /**
   * Swipe axis. Reactive — accepts a ref or getter.
   * @default 'horizontal'
   */
  direction?: MaybeRefOrGetter<'horizontal' | 'vertical'>
  /**
   * Minimum swipe distance (px) for a successful swipe.
   * @default 10
   */
  swipeThreshold?: number
  /**
   * Fraction of the container size (0–1) the finger must travel
   * for a slow-drag to count as a successful swipe.
   * @default 0.35
   */
  distanceThreshold?: number
  /**
   * Minimum velocity (px / ms) for a quick-flick to count as a swipe,
   * regardless of distance traveled.
   * @default 0.3
   */
  velocityThreshold?: number
  /** Fires when the pointer touches down and the gesture begins. */
  onPress?: (state: SwipePressState) => void
  /** Fires continuously while the pointer moves. */
  onFollow?: (state: SwipeFollowState) => void
  /**
   * Fires on pointer-up or pointer-cancel.
   * Check `state.swiped` to decide whether to commit the transition or snap back.
   */
  onRelease?: (state: SwipeReleaseState) => void
}

export function useSwipeGesture(
  containerRef: MaybeElementRef<HTMLElement>,
  options: SwipeGestureOptions = {},
) {
  const {
    handleSelector,
    distanceThreshold = 0.35,
    velocityThreshold = 0.3,
    swipeThreshold = 10,
    onPress,
    onFollow,
    onRelease,
  } = options

  let at: Core | null = null

  function isHorizontal() {
    return (toValue(options.direction) ?? 'horizontal') === 'horizontal'
  }

  function resolveDirection(displacement: number, horizontal: boolean): SwipeDirection {
    return horizontal ? (displacement > 0 ? 'right' : 'left') : displacement > 0 ? 'bottom' : 'top'
  }

  function bind() {
    const container = unrefElement(containerRef)
    if (!container) {
      return
    }

    const handle = handleSelector ? container.querySelector<HTMLElement>(handleSelector) : container
    if (!handle) {
      return
    }

    at = new Core(handle)

    at.use(Pan, { threshold: swipeThreshold })

    let containerSize = 0

    at.on('panstart', () => {
      const h = isHorizontal()
      containerSize = h ? container.offsetWidth : container.offsetHeight

      onPress?.({ size: containerSize })
    })

    at.on('panmove', (e) => {
      const h = isHorizontal()
      const displacement = h ? e.displacementX : e.displacementY
      const delta = h ? e.deltaX : e.deltaY
      const velocity = h ? e.velocityX : e.velocityY

      onFollow?.({
        delta,
        velocity,
        displacement,
        offset: containerSize > 0 ? displacement / containerSize : 0,
      })
    })

    at.on('panend', (e) => {
      const h = isHorizontal()
      const displacement = h ? e.displacementX : e.displacementY
      const velocity = h ? e.velocityX : e.velocityY

      if (containerSize === 0 || displacement === 0) {
        onRelease?.({ swiped: false })
        return
      }

      const meetsVelocity = velocity >= velocityThreshold
      const meetsDistance = Math.abs(displacement) / containerSize >= distanceThreshold

      if (meetsVelocity || meetsDistance) {
        onRelease?.({ swiped: true, direction: resolveDirection(displacement, h) })
      } else {
        onRelease?.({ swiped: false })
      }
    })

    at.on('pancancel', () => {
      onRelease?.({ swiped: false })
    })
  }

  function unbind() {
    if (!at) {
      return
    }
    at.destroy()
    at = null
  }

  function stop() {
    unwatch()
    unbind()
  }

  const unwatch = watch(
    () => [unrefElement(containerRef), toValue(options.disabled)],
    ([el, disabled]) => {
      if (!el || disabled) {
        unbind()
        return
      }

      bind()
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    stop()
  })

  return {
    stop,
  }
}
