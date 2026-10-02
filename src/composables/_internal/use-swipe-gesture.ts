import type { MaybeElementRef } from '../../types/shared'
import type { MaybeRefOrGetter } from 'vue'
import { nextTick, onScopeDispose, watch } from 'vue'
import { getElement } from '../../utils/dom.js'
import { toValue } from '../../utils/helper.js'

export type SwipeDirection = 'left' | 'right' | 'top' | 'bottom'

export interface SwipePressState {
  size: number
  /** The pointerdown event that opened the gesture. */
  event: PointerEvent
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
  /** The pointermove event that produced this sample. */
  event: PointerEvent
}

export interface SwipeReleaseState {
  /** Whether the gesture qualified as a successful swipe (by velocity or distance). */
  swiped: boolean
  /** Physical swipe direction. `undefined` when `swiped` is `false`. */
  direction?: SwipeDirection
  /** Signed displacement at release along the active axis (px). */
  displacement: number
  /** Signed velocity at release (px / ms). */
  velocity: number
  /** Whether the gesture stayed on the target axis from the moment it was locked. */
  axisLocked: boolean
  /** The pointerup or pointercancel event that ended the gesture. */
  event: PointerEvent
}

export interface SwipeTapState {
  /** The pointerup event that ended the interaction. */
  event: PointerEvent
  /**
   * The pointerdown event that started it. A release that never became a pan can
   * land on a different element, so hit-testing should use what the user pressed.
   */
  startEvent: PointerEvent | null
  /**
   * `true` when `beforeStart` discarded the gesture, `false` when the pointer
   * simply never travelled far enough to be recognized.
   */
  vetoed: boolean
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
  /**
   * Gate evaluated once the gesture is recognized. Resolving `false` discards the
   * gesture: `onFollow` never fires and the release is reported through `onTap`
   * with `vetoed: true`. Movement arriving while a promise is pending is dropped,
   * and a release inside that window waits for the verdict.
   */
  beforeStart?: (state: SwipePressState) => boolean | Promise<boolean>
  onPress?: (state: SwipePressState) => void
  onFollow?: (state: SwipeFollowState) => void
  /**
   * Receives the raw release metrics. `swiped` and `direction` follow
   * `distanceThreshold` / `velocityThreshold` against the container size; consumers
   * that measure against something else decide from `displacement` themselves.
   */
  onRelease?: (state: SwipeReleaseState) => void
  /**
   * Called on release when no swipe was ever recognized: the pointer travelled less
   * than `swipeThreshold`, or `beforeStart` discarded it.
   */
  onTap?: (state: SwipeTapState) => void
}

interface SwipePanEvent {
  displacementX: number
  displacementY: number
  deltaX: number
  deltaY: number
  velocityX: number
  velocityY: number
  event: PointerEvent
}

function isThenable(value: unknown): value is Promise<boolean> {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Promise<boolean>).then === 'function'
  )
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
    beforeStart,
    onPress,
    onFollow,
    onRelease,
    onTap,
  } = options

  let recognizer: PointerSwipeRecognizer | null = null
  let stopped = false

  type AxisLockState = 'pending' | 'accepted' | 'rejected'
  type StartVerdict = 'pending' | 'allowed' | 'vetoed'

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
    let startVerdict: StartVerdict = 'pending'
    let startGate: Promise<boolean> | null = null
    let released = false

    // A tap never reaches `onStart`, so per-gesture state has to be cleared by
    // whichever handler ends the interaction instead of on the next gesture.
    function resetGesture() {
      axisLockState = 'pending'
      startVerdict = 'pending'
      startGate = null
    }

    // A release landing while the start gate is still pending cannot be classified
    // yet: it only counts as a tap when the gate allowed the gesture.
    function emitTap(event: PointerEvent, startEvent: PointerEvent | null) {
      const verdict = startVerdict
      const gate = startGate

      if (!onTap) {
        return
      }

      if (verdict === 'pending' && gate) {
        void gate.then((allowed) => onTap?.({ event, startEvent, vetoed: !allowed }))
        return
      }

      onTap({ event, startEvent, vetoed: verdict === 'vetoed' })
    }

    function resolveStart(event: PointerEvent) {
      const state: SwipePressState = { size: containerSize, event }

      if (!beforeStart) {
        startVerdict = 'allowed'
        onPress?.(state)
        return
      }

      const verdict = beforeStart(state)

      if (isThenable(verdict)) {
        startGate = verdict
        void verdict.then((allowed) => {
          if (released) {
            return
          }

          startVerdict = allowed ? 'allowed' : 'vetoed'

          if (startVerdict === 'allowed') {
            onPress?.(state)
          }
        })
        return
      }

      startVerdict = verdict ? 'allowed' : 'vetoed'

      if (startVerdict === 'allowed') {
        onPress?.(state)
      }
    }

    recognizer = new PointerSwipeRecognizer(handle, {
      threshold: swipeThreshold,
      touchAction: getTouchAction(),
      onStart: (event) => {
        axisLockState = 'pending'
        released = false
        containerSize = isHorizontal() ? container.offsetWidth : container.offsetHeight
        resolveStart(event.event)
      },
      onMove: (event) => {
        if (startVerdict !== 'allowed') {
          return
        }

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
          event: event.event,
        })
      },
      onEnd: (event) => {
        released = true

        if (startVerdict !== 'allowed') {
          emitTap(event.event, event.startEvent)
          resetGesture()
          return
        }

        const h = isHorizontal()

        if (axisLockState === 'pending') {
          axisLockState = resolveAxisLock(event, h)
        }

        const { displacement, velocity } = getAxisValue(event, h)
        const axisLocked = axisLockState === 'accepted'
        const swiped =
          axisLocked &&
          containerSize > 0 &&
          displacement !== 0 &&
          (Math.abs(velocity) >= velocityThreshold ||
            Math.abs(displacement) / containerSize >= distanceThreshold)

        onRelease?.({
          swiped,
          direction: swiped ? resolveDirection(displacement, h) : undefined,
          displacement,
          velocity,
          axisLocked,
          event: event.event,
        })
        resetGesture()
      },
      onIdle: (event, startEvent) => {
        released = true
        emitTap(event, startEvent)
        resetGesture()
      },
      onCancel: (event) => {
        released = true

        onRelease?.({
          swiped: false,
          displacement: 0,
          velocity: 0,
          axisLocked: false,
          event,
        })
        resetGesture()
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
  onCancel?: (event: PointerEvent) => void
  onIdle?: (event: PointerEvent, startEvent: PointerEvent | null) => void
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
  event: PointerEvent
  startEvent: PointerEvent | null
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
  private startEvent: PointerEvent | null = null
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
      this.startEvent = event
      this.startPoint = getPointerPoint(event)
      this.previousPoint = this.startPoint
      this.previousTime = Date.now()
      this.lastVelocity = { x: 0, y: 0 }
      this.hasRecognizedPan = (this.options.threshold ?? 10) <= 0
      el.setPointerCapture?.(event.pointerId)

      if (this.hasRecognizedPan) {
        this.emitPan(this.options.onStart, event, this.startPoint, 0, 0)
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
        this.emitPan(this.options.onStart, event, point, displacementX, displacementY)
      }

      this.emitPan(this.options.onMove, event, point, displacementX, displacementY)
    }

    const onPointerUp = (event: PointerEvent) => {
      if (event.pointerId !== this.activePointerId || !this.startPoint) {
        return
      }

      const point = getPointerPoint(event)

      if (this.hasRecognizedPan) {
        this.emitPan(
          this.options.onEnd,
          event,
          point,
          point.x - this.startPoint.x,
          point.y - this.startPoint.y,
        )
      } else {
        this.options.onIdle?.(event, this.startEvent)
      }

      el.releasePointerCapture?.(event.pointerId)
      this.reset()
    }

    const onPointerCancel = (event: PointerEvent) => {
      if (event.pointerId !== this.activePointerId) {
        return
      }

      this.options.onCancel?.(event)
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
    source: PointerEvent,
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
      event: source,
      startEvent: this.startEvent,
    })
  }

  private reset(): void {
    this.startPoint = null
    this.previousPoint = null
    this.previousTime = 0
    this.lastVelocity = { x: 0, y: 0 }
    this.activePointerId = null
    this.hasRecognizedPan = false
    this.startEvent = null
  }
}
