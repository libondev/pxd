import type { MaybeElementRef } from '../types/shared'
import type { MaybeRefOrGetter } from 'vue'
import { nextTick, onScopeDispose, watch } from 'vue'
import { getElement } from '../utils/dom'
import { toValue } from '../utils/helper'

export type SwipeDirection = 'left' | 'right' | 'top' | 'bottom'

export interface SwipePressState {
  size: number
}

export interface SwipeFollowState {
  /** Movement since the previous event along the active axis (px). */
  delta: number
  /** Signed velocity (px / ms) since the previous event along the active axis. */
  velocity: number
  /** `displacement / containerSize` signed ratio, typically in the range of -1 to 1. */
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
  /** CSS selector for the drag handle element within the container. */
  handleSelector?: string
  /** Swipe axis. Reactive; accepts a ref or getter. */
  axis?: MaybeRefOrGetter<'horizontal' | 'vertical'>
  /** Minimum movement (px) before locking the gesture axis. */
  axisLockThreshold?: number
  /** Main-axis movement must be at least this multiple of cross-axis movement. */
  axisLockRatio?: number
  /** Minimum swipe distance (px) before movement events start. */
  swipeThreshold?: number
  /** Fraction of the container size the finger must travel for a slow-drag swipe. */
  distanceThreshold?: number
  /** Minimum absolute velocity (px / ms) for a quick-flick swipe. */
  velocityThreshold?: number
  onPress?: (state: SwipePressState) => void
  onFollow?: (state: SwipeFollowState) => void
  onRelease?: (state: SwipeReleaseState) => void
}

interface SwipePanEvent {
  displacementX: number
  displacementY: number
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
}

export function useSwipeGesture(
  containerRef: MaybeElementRef<HTMLElement>,
  options: SwipeGestureOptions = {},
) {
  const {
    handleSelector,
    axisLockThreshold = 0,
    axisLockRatio = 1,
    distanceThreshold = 0.35,
    velocityThreshold = 0.3,
    swipeThreshold = 10,
    onPress,
    onFollow,
    onRelease,
  } = options

  let recognizer: PointerSwipeRecognizer | null = null
  let stopped = false

  type AxisLockState = 'pending' | 'accepted' | 'rejected'

  function isHorizontal() {
    return (toValue(options.axis) ?? 'horizontal') === 'horizontal'
  }

  function getAxisValue(event: SwipePanEvent, horizontal: boolean) {
    return horizontal
      ? {
          displacement: event.displacementX,
          crossDisplacement: event.displacementY,
          delta: event.deltaX,
          velocity: event.velocityX,
        }
      : {
          displacement: event.displacementY,
          crossDisplacement: event.displacementX,
          delta: event.deltaY,
          velocity: event.velocityY,
        }
  }

  function resolveDirection(displacement: number, horizontal: boolean): SwipeDirection {
    return horizontal ? (displacement > 0 ? 'right' : 'left') : displacement > 0 ? 'bottom' : 'top'
  }

  function resolveAxisLock(event: SwipePanEvent, horizontal: boolean): AxisLockState {
    const { displacement, crossDisplacement } = getAxisValue(event, horizontal)
    const mainDistance = Math.abs(displacement)
    const crossDistance = Math.abs(crossDisplacement)

    if (Math.hypot(mainDistance, crossDistance) < axisLockThreshold) {
      return 'pending'
    }

    return mainDistance >= crossDistance * axisLockRatio ? 'accepted' : 'rejected'
  }

  function getTouchAction() {
    return isHorizontal() ? 'pan-y' : 'pan-x'
  }

  function bind() {
    const container = getElement(containerRef)

    if (!container) {
      return
    }

    unbind()

    const handle = handleSelector ? container.querySelector<HTMLElement>(handleSelector) : container
    if (!handle) {
      return
    }

    let containerSize = 0
    let axisLockState: AxisLockState = 'pending'

    recognizer = new PointerSwipeRecognizer(handle, {
      threshold: swipeThreshold,
      touchAction: getTouchAction(),
      onStart: () => {
        const h = isHorizontal()
        axisLockState = 'pending'
        containerSize = h ? container.offsetWidth : container.offsetHeight
        onPress?.({ size: containerSize })
      },
      onMove: (event) => {
        const h = isHorizontal()

        if (axisLockState === 'pending') {
          axisLockState = resolveAxisLock(event, h)
        }

        if (axisLockState !== 'accepted') {
          return
        }

        const { displacement, delta, velocity } = getAxisValue(event, h)

        onFollow?.({
          delta,
          velocity,
          displacement,
          offset: containerSize > 0 ? displacement / containerSize : 0,
        })
      },
      onEnd: (event) => {
        const h = isHorizontal()

        if (axisLockState === 'pending') {
          axisLockState = resolveAxisLock(event, h)
        }

        if (axisLockState !== 'accepted') {
          onRelease?.({ swiped: false })
          return
        }

        const { displacement, velocity } = getAxisValue(event, h)

        if (containerSize === 0 || displacement === 0) {
          onRelease?.({ swiped: false })
          return
        }

        const meetsVelocity = Math.abs(velocity) >= velocityThreshold
        const meetsDistance = Math.abs(displacement) / containerSize >= distanceThreshold

        onRelease?.(
          meetsVelocity || meetsDistance
            ? { swiped: true, direction: resolveDirection(displacement, h) }
            : { swiped: false },
        )
      },
      onCancel: () => {
        onRelease?.({ swiped: false })
      },
    })
  }

  function unbind() {
    recognizer?.destroy()
    recognizer = null
  }

  function stop() {
    stopped = true
    unwatch()
    unbind()
  }

  const unwatch = watch(
    () => [getElement(containerRef), toValue(options.disabled), toValue(options.axis)] as const,
    async ([el, disabled]) => {
      if (!el || disabled) {
        unbind()
        return
      }

      await nextTick()

      if (stopped || getElement(containerRef) !== el || toValue(options.disabled)) {
        return
      }

      bind()
    },
    { immediate: true, flush: 'post' },
  )

  onScopeDispose(() => {
    stop()
  })

  return {
    stop,
  }
}

interface PointerSwipeRecognizerOptions {
  threshold?: number
  touchAction?: string
  onStart?: (event: PointerPanEvent) => void
  onMove?: (event: PointerPanEvent) => void
  onEnd?: (event: PointerPanEvent) => void
  onCancel?: (event: PointerPanEvent) => void
}

interface PointerPoint {
  x: number
  y: number
}

interface PointerVelocity {
  x: number
  y: number
}

interface PointerPanEvent {
  displacementX: number
  displacementY: number
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
}

function getPointerPoint(event: PointerEvent): PointerPoint {
  return { x: event.clientX, y: event.clientY }
}

class PointerSwipeRecognizer {
  private cleanup: (() => void) | null = null
  private startPoint: PointerPoint | null = null
  private previousPoint: PointerPoint | null = null
  private previousTime = 0
  private lastVelocity: PointerVelocity = { x: 0, y: 0 }
  private activePointerId: number | null = null
  private hasRecognizedPan = false
  private originalTouchAction = ''

  constructor(
    private el: HTMLElement | SVGElement,
    private options: PointerSwipeRecognizerOptions = {},
  ) {
    ;(el.style as any).webkitTapHighlightColor = 'rgba(0,0,0,0)'
    this.originalTouchAction = el.style.touchAction
    el.style.touchAction = options.touchAction ?? 'none'
    this.cleanup = this.bindEvents(el)
  }

  destroy(): void {
    this.cleanup?.()
    this.cleanup = null
    this.el.style.touchAction = this.originalTouchAction
  }

  private bindEvents(el: HTMLElement | SVGElement): () => void {
    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || event.button !== 0) {
        return
      }

      this.activePointerId = event.pointerId
      this.startPoint = getPointerPoint(event)
      this.previousPoint = this.startPoint
      this.previousTime = Date.now()
      this.lastVelocity = { x: 0, y: 0 }
      this.hasRecognizedPan = (this.options.threshold ?? 10) <= 0
      el.setPointerCapture?.(event.pointerId)

      if (this.hasRecognizedPan) {
        this.emitPan(this.options.onStart, this.startPoint, 0, 0)
      }
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerId !== this.activePointerId || !this.startPoint || !this.previousPoint) {
        return
      }

      const point = getPointerPoint(event)
      const displacementX = point.x - this.startPoint.x
      const displacementY = point.y - this.startPoint.y
      const distance = Math.hypot(displacementX, displacementY)

      if (!this.hasRecognizedPan) {
        if (distance < (this.options.threshold ?? 10)) {
          return
        }

        this.hasRecognizedPan = true
        this.emitPan(this.options.onStart, point, displacementX, displacementY)
      }

      this.emitPan(this.options.onMove, point, displacementX, displacementY)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== this.activePointerId || !this.startPoint) {
        return
      }

      const point = getPointerPoint(event)

      if (this.hasRecognizedPan) {
        this.emitPan(
          this.options.onEnd,
          point,
          point.x - this.startPoint.x,
          point.y - this.startPoint.y,
        )
      }

      el.releasePointerCapture?.(event.pointerId)
      this.reset()
    }

    const onPointerCancel = (event: PointerEvent) => {
      if (event.pointerId !== this.activePointerId) {
        return
      }

      const point = getPointerPoint(event)
      this.emitPan(
        this.options.onCancel,
        point,
        this.startPoint ? point.x - this.startPoint.x : 0,
        this.startPoint ? point.y - this.startPoint.y : 0,
      )
      el.releasePointerCapture?.(event.pointerId)
      this.reset()
    }

    el.addEventListener('pointerdown', onPointerDown as EventListener)
    window.addEventListener('pointermove', onPointerMove as EventListener)
    window.addEventListener('pointerup', onPointerUp as EventListener)
    window.addEventListener('pointercancel', onPointerCancel as EventListener)

    return () => {
      el.removeEventListener('pointerdown', onPointerDown as EventListener)
      window.removeEventListener('pointermove', onPointerMove as EventListener)
      window.removeEventListener('pointerup', onPointerUp as EventListener)
      window.removeEventListener('pointercancel', onPointerCancel as EventListener)
    }
  }

  private emitPan(
    callback: ((event: PointerPanEvent) => void) | undefined,
    point: PointerPoint,
    displacementX: number,
    displacementY: number,
  ): void {
    const now = Date.now()
    const elapsed = Math.max(1, now - this.previousTime)
    const deltaX = point.x - (this.previousPoint?.x ?? point.x)
    const deltaY = point.y - (this.previousPoint?.y ?? point.y)
    const velocityX = deltaX === 0 ? this.lastVelocity.x : deltaX / elapsed
    const velocityY = deltaY === 0 ? this.lastVelocity.y : deltaY / elapsed

    if (deltaX !== 0 || deltaY !== 0) {
      this.lastVelocity = { x: velocityX, y: velocityY }
    }

    this.previousPoint = point
    this.previousTime = now

    callback?.({
      displacementX,
      displacementY,
      deltaX,
      deltaY,
      velocityX,
      velocityY,
    })
  }

  private reset(): void {
    this.startPoint = null
    this.previousPoint = null
    this.previousTime = 0
    this.lastVelocity = { x: 0, y: 0 }
    this.activePointerId = null
    this.hasRecognizedPan = false
  }
}
