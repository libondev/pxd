import type { MaybeElementRef, Nullable } from '../types/shared/utils'
import { onBeforeUnmount, shallowRef, watch } from 'vue'
import { getScrollContainer, getScrollElByContainer } from '../utils/dom'
import { toValue } from '../utils/ref'

type Axis = 'x' | 'y' | 'both'
type Dir = 'left' | 'right' | 'up' | 'down' | null

/**
 * 带时间戳的坐标点。
 * @property x - X 坐标（px）
 * @property y - Y 坐标（px）
 * @property t - 时间戳（ms，来自 performance.now()）
 */
interface Point { x: number, y: number, t: number }

/**
 * 速度向量。
 * @property x - X 方向速度（px/s）
 * @property y - Y 方向速度（px/s）
 * @property v - 合速度（px/s）
 */
interface Velocity { x: number, y: number, v: number }

/**
 * 对外公开的手势状态。
 * @property isActive - 指针是否按下激活
 * @property isDragging - 是否处于拖拽中（超过启动阈值）
 * @property isLongPressing - 是否处于长按态
 * @property direction - 当前判定的方向（可能为 null）
 * @property delta - 自按下以来位移（px）
 * @property velocity - 当前速度（px/s）
 * @property progress - 触发进度（0~1，基于 triggerThreshold）
 */
export interface PublicState {
  isActive: boolean
  isDragging: boolean
  isLongPressing: boolean
  direction: Dir
  delta: { x: number, y: number }
  velocity: Velocity
  progress: number
}

/**
 * usePointerGesture 的可配置项。
 * 如未指定，均有默认值（见 OPTIONS_DEFAULTS）。
 */
export interface UsePointerGestureOptions {
  /**
   * 限制生效轴向。
   * 返回 'x' | 'y' | 'both'，默认为 'both'。
   */
  axis?: () => Axis
  /**
   * 拖拽启动阈值（px）。手指移动距离超过该值后进入拖拽。
   * 默认 6。
   */
  startThreshold?: number
  /**
   * 触发阈值（px）。释放时若位移达到该值视为命中触发（kind='threshold'）。
   * 默认 80。
   */
  triggerThreshold?: number
  /**
   * 甩动触发速度阈值（px/s）。移动中若合速度超过该值将记录可能触发为 'fling'。
   * 默认 1000。
   */
  velocityThreshold?: number
  /**
   * 长按判定时长（ms）。到达该时长后进入长按态并触发 onLongPress。
   * 默认 300。
   */
  longPressMs?: number
  /**
   * 长按容忍移动距离（px）。在进入拖拽前，若移动超过该距离则取消长按。
   * 默认 4。
   */
  longPressMoveTolerance?: number
  /**
   * 是否在拖拽开始时锁定轴向。开启后根据初始位移较大方向锁定为 'x' 或 'y'。
   * 默认 true。
   */
  lockDirectionOnStart?: boolean
  /**
   * 是否允许在可滚动容器尚可继续滚动时将移动交由滚动，直到触达边缘才接管拖拽。
   * 默认 true。
   */
  allowScrollUntilEdge?: boolean
  /**
   * 拖拽期间是否调用 preventDefault 阻止滚动。
   * 默认 true。
   */
  preventScrollOnDrag?: boolean
  /**
   * 是否使用 Pointer Capture（setPointerCapture/releasePointerCapture）。
   * 默认 true。
   */
  usePointerCapture?: boolean
  /**
   * RTL 支持：
   * - 若为 boolean，true 表示水平方向取反（dx>0 视为向左）；false 为自然方向
   * - 若为函数，可根据 dx 自定义返回 'left' 或 'right'
   * 默认 false。
   */
  rtl?: boolean | ((dx: number) => 'left' | 'right')
  /**
   * 提供一个返回可参与滚动判断的元素（通常为最近滚动容器内的滚动元素）。
   * 若不提供，将自动查找。
   */
  getScrollable?: () => HTMLElement | null
  /**
   * 指针按下时回调。
   * @param e - PointerEvent
   * @param ctx - 当前公开状态
   */
  onStart?: (e: PointerEvent, ctx: PublicState) => void
  /**
   * 指针移动时回调（拖拽中会持续触发，可用于执行动画）。
   * @param e - PointerEvent
   * @param ctx - 当前公开状态
   */
  onMove?: (e: PointerEvent, ctx: PublicState) => void
  /**
   * 指针释放时统一回调。
   * - 命中触发条件时：hit=true，并给出方向 dir 与触发类型 kind（'threshold' | 'longpress' | 'fling'）
   * - 未命中时：hit=false，dir=null，kind=null；此时会自动调用 onReset 便于复位动画
   * @param hit - 是否命中触发
   * @param dir - 方向（未命中为 null）
   * @param kind - 触发类型（未命中为 null）
   * @param ctx - 当前公开状态
   */
  onRelease?: (hit: boolean, dir: Dir, kind: null | 'threshold' | 'longpress' | 'fling', ctx: PublicState) => void
  /**
   * 指针生命周期结束时回调（在 onRelease 之前调用）。
   * @param e - PointerEvent
   * @param ctx - 当前公开状态
   */
  onEnd?: (e: PointerEvent, ctx: PublicState) => void
  /**
   * 手势被取消时回调（如 pointercancel 或主动 cancel）。
   * @param e - 事件对象；由 cancel() 触发时为 null
   * @param ctx - 当前公开状态
   */
  onCancel?: (e: Event | null, ctx: PublicState) => void
  /**
   * 复位回调：取消或未命中触发条件时会自动调用，便于执行复位动画。
   * @param ctx - 当前公开状态
   */
  onReset?: (ctx: PublicState) => void
  /**
   * 长按回调：达到长按时长后触发。
   * @param ctx - 当前公开状态
   */
  onLongPress?: (ctx: PublicState) => void
  /**
   * 指针守卫：记录后续是否需要响应事件, 只在 pointer-down 中执行一次
   * 返回 true 表示允许，false 表示阻止触发。
   * @param e - PointerEvent
   */
  pointerGuard?: (e: PointerEvent) => boolean
  /**
   * 方向守卫：在记录触发与最终释放判定处均会调用，用于限制允许的触发方向。
   * 返回 true 表示允许，false 表示阻止触发。
   * @param dir - 非空方向
   * @param ctx - 当前公开状态
   */
  directionGuard?: (dir: Exclude<Dir, null>, ctx: PublicState) => boolean
}

const OPTIONS_DEFAULTS = {
  rtl: false,
  axis: 'both',
  startThreshold: 6,
  triggerThreshold: 80,
  velocityThreshold: 1000,
  longPressMs: 300,
  longPressMoveTolerance: 4,
  lockDirectionOnStart: true,
  allowScrollUntilEdge: true,
  preventScrollOnDrag: true,
  usePointerCapture: true,
}

export function usePointerGesture(container: MaybeElementRef<HTMLElement>, options: UsePointerGestureOptions = {}) {
  const isActive = shallowRef(false)
  const isDragging = shallowRef(false)
  const isLongPressing = shallowRef(false)
  const direction = shallowRef<Dir>(null)
  const delta = shallowRef({ x: 0, y: 0 })
  const progress = shallowRef(0)
  const velocity = shallowRef<Velocity>({ x: 0, y: 0, v: 0 })

  let captured = false
  let start: Point | null = null
  let last: Point | null = null
  let lockedAxis: Axis | null = null
  let activePointerId: number | null = null
  let longPressTimer: ReturnType<typeof setTimeout> | null
  // 记录可能的触发类型（在释放时统一判定与回调）
  let mayTriggerKind: 'threshold' | 'longpress' | 'fling' | null = null
  // 记录当前绑定的元素与滚动容器，避免在 move 高频路径反复查询
  let boundEl: HTMLElement | null = null
  let boundScrollEl: HTMLElement | null = null
  // 拖拽开始时仅清一次文本选区
  let didClearSelectionOnDragStart = false

  const now = () => performance.now()

  function resolveHorizontalDir(dx: number): 'left' | 'right' {
    const r = options.rtl ?? OPTIONS_DEFAULTS.rtl
    if (typeof r === 'function') {
      return r(dx)
    }
    if (r === true) {
      return dx > 0 ? 'left' : 'right'
    }
    return dx > 0 ? 'right' : 'left'
  }

  function computeDir(dx: number, dy: number): Dir {
    if (Math.abs(dx) >= Math.abs(dy)) {
      return dx === 0 ? null : resolveHorizontalDir(dx)
    }
    return dy === 0 ? null : (dy > 0 ? 'down' : 'up')
  }

  function updateVelocity(curr: Point, prev: Point | null) {
    if (!prev) {
      velocity.value = { x: 0, y: 0, v: 0 }
      return
    }
    const dt = Math.max(1, curr.t - prev.t)
    const vx = ((curr.x - prev.x) / dt) * 1000
    const vy = ((curr.y - prev.y) / dt) * 1000
    velocity.value = { x: vx, y: vy, v: Math.hypot(vx, vy) }
  }

  function axisAllowed(dx: number, dy: number) {
    const axis = options.axis?.() || OPTIONS_DEFAULTS.axis

    if (axis === 'both') {
      return true
    } else if (axis === 'x') {
      return Math.abs(dx) >= Math.abs(dy)
    } else if (axis === 'y') {
      return Math.abs(dy) >= Math.abs(dx)
    }

    return true
  }

  function updateProgress(dx: number, dy: number) {
    const triggerThreshold = options.triggerThreshold ?? OPTIONS_DEFAULTS.triggerThreshold

    let primary: number
    if (lockedAxis === 'y') {
      primary = Math.abs(dy)
    } else if (lockedAxis === 'x') {
      primary = Math.abs(dx)
    } else {
      primary = Math.abs(Math.abs(dx) >= Math.abs(dy) ? dx : dy)
    }
    progress.value = Math.max(0, Math.min(1, primary / triggerThreshold))
  }

  function getScrollEl(): HTMLElement | null {
    if (typeof options.getScrollable === 'function') {
      return options.getScrollable()
    }

    const el = boundEl
      ? getScrollContainer(boundEl)
      : toValue(container) && getScrollContainer(toValue(container)!)

    if (!el) {
      return null
    }

    return getScrollElByContainer(el)
  }

  function canScrollFurther(scrollEl: HTMLElement, dx: number, dy: number) {
    const { scrollTop, scrollHeight, clientHeight, scrollLeft, scrollWidth, clientWidth } = scrollEl
    const atTop = scrollTop <= 0
    const atBottom = scrollTop + clientHeight >= scrollHeight
    const atLeft = scrollLeft <= 0
    const atRight = scrollLeft + clientWidth >= scrollWidth
    const horizontal = Math.abs(dx) >= Math.abs(dy)
    if (horizontal) {
      if (dx < 0) {
        return !atRight
      }
      if (dx > 0) {
        return !atLeft
      }
    } else {
      if (dy < 0) {
        return !atBottom
      }
      if (dy > 0) {
        return !atTop
      }
    }
    return false
  }

  // 统一封装：在拖拽过程中取消文本选中，避免选择高亮
  function clearTextSelection() {
    try {
      const sel = window.getSelection?.()
      sel?.removeAllRanges?.()
    } catch {}
  }

  function clearLongPress() {
    if (longPressTimer != null) {
      clearTimeout(longPressTimer)
      longPressTimer = null
    }
    // 同步清除文本选中（长按被打断或进入拖拽时）
    clearTextSelection()
  }

  function startLongPress() {
    clearLongPress()
    const lp = (options.longPressMs ?? OPTIONS_DEFAULTS.longPressMs)
    if (lp <= 0) {
      return
    }

    longPressTimer = setTimeout(() => {
      isLongPressing.value = true
      options.onLongPress?.(publicState())
    }, lp)
  }

  function publicState(): PublicState {
    return {
      isActive: isActive.value,
      isDragging: isDragging.value,
      isLongPressing: isLongPressing.value,
      direction: direction.value,
      delta: { ...delta.value },
      velocity: { ...velocity.value },
      progress: progress.value,
    }
  }

  function resetInternal() {
    clearLongPress()
    if (captured && boundEl && activePointerId != null) {
      try {
        boundEl.releasePointerCapture(activePointerId)
      } catch {}
    }
    captured = false
    isActive.value = false
    isDragging.value = false
    isLongPressing.value = false
    direction.value = null
    delta.value = { x: 0, y: 0 }
    velocity.value = { x: 0, y: 0, v: 0 }
    progress.value = 0
    start = null
    last = null
    lockedAxis = null
    activePointerId = null
    mayTriggerKind = null
    boundScrollEl = null
    didClearSelectionOnDragStart = false
  }

  // 仅记录，真实触发在 onPointerUp 统一处理
  function markTrigger(kind: 'fling' | 'threshold' | 'longpress') {
    const dir = direction.value
    if (!dir) {
      return
    }

    if (options.directionGuard && !options.directionGuard(dir as Exclude<Dir, null>, publicState())) {
      return
    }

    mayTriggerKind = kind
  }

  function onPointerDown(e: PointerEvent) {
    const usePointerCapture = (options.usePointerCapture ?? OPTIONS_DEFAULTS.usePointerCapture)

    if (e.button != null && e.button !== 0) {
      return
    }

    if (typeof options.pointerGuard === 'function' && !options.pointerGuard(e)) {
      return
    }

    activePointerId = e.pointerId
    isActive.value = true
    const t = now()
    start = last = { x: e.clientX, y: e.clientY, t }
    direction.value = null
    delta.value = { x: 0, y: 0 }
    velocity.value = { x: 0, y: 0, v: 0 }
    progress.value = 0
    lockedAxis = null
    isLongPressing.value = false
    mayTriggerKind = null
    didClearSelectionOnDragStart = false
    startLongPress()
    options.onStart?.(e, publicState())

    boundEl = toValue(container)!

    if (usePointerCapture && boundEl) {
      try {
        boundEl.setPointerCapture(e.pointerId)
        captured = true
      } catch {
        captured = false
      }
    }

    const el = boundEl!

    el.addEventListener('pointermove', onPointerMove, { passive: false, capture: true })
    el.addEventListener('pointerup', onPointerUp, { passive: true, once: true, capture: true })
    el.addEventListener('pointercancel', onPointerCancel, { passive: true, once: true, capture: true })

    // 在按下时缓存滚动容器（可根据需要在 move 中惰性初始化）
    boundScrollEl = getScrollEl()
  }

  function onPointerMove(e: PointerEvent) {
    const longPressMoveTolerance = (options.longPressMoveTolerance ?? OPTIONS_DEFAULTS.longPressMoveTolerance)
    const allowScrollUntilEdge = (options.allowScrollUntilEdge ?? OPTIONS_DEFAULTS.allowScrollUntilEdge)
    const preventScrollOnDrag = (options.preventScrollOnDrag ?? OPTIONS_DEFAULTS.preventScrollOnDrag)
    const velocityThreshold = (options.velocityThreshold ?? OPTIONS_DEFAULTS.velocityThreshold)

    if (!start) {
      return
    }
    const curr: Point = { x: e.clientX, y: e.clientY, t: now() }
    const dx = curr.x - start.x
    const dy = curr.y - start.y

    if (!isDragging.value && Math.hypot(dx, dy) > longPressMoveTolerance) {
      clearLongPress()
    }

    if (allowScrollUntilEdge) {
      const sc = boundScrollEl ?? (boundScrollEl = getScrollEl())
      if (sc && canScrollFurther(sc, dx, dy)) {
        const prev = last
        last = curr
        updateVelocity(curr, prev ?? last)
        return
      }
    }

    if (!isDragging.value) {
      const st = options.startThreshold ?? OPTIONS_DEFAULTS.startThreshold
      const lck = options.lockDirectionOnStart ?? OPTIONS_DEFAULTS.lockDirectionOnStart

      if (Math.hypot(dx, dy) >= st && axisAllowed(dx, dy)) {
        isDragging.value = true
        if (lck) {
          lockedAxis = Math.abs(dx) >= Math.abs(dy) ? 'x' : 'y'
        }
        if (preventScrollOnDrag) {
          try {
            e.preventDefault()
          } catch {}
        }
        if (!didClearSelectionOnDragStart) {
          clearTextSelection()
          didClearSelectionOnDragStart = true
        }
      }
    }

    if (isDragging.value) {
      if (preventScrollOnDrag) {
        e.preventDefault()
      }

      const prev = last
      delta.value = { x: dx, y: dy }
      direction.value = computeDir(dx, dy)
      updateVelocity(curr, prev)
      updateProgress(dx, dy)

      // 在移动阶段允许 onMove 执行动画；达到速度阈值仅记录可能触发类型
      if (velocity.value.v >= velocityThreshold) {
        markTrigger('fling')
      }

      options.onMove?.(e, publicState())
    }

    last = curr
  }

  function onPointerUp(e: PointerEvent) {
    const triggerThreshold = (options.triggerThreshold ?? OPTIONS_DEFAULTS.triggerThreshold)
    const requiresMoveForLongPress = (options as any).longPressRequiresMovement ?? (OPTIONS_DEFAULTS as any).longPressRequiresMovement

    const curr: Point = { x: e.clientX, y: e.clientY, t: now() }
    let hit = false
    let kind: null | 'threshold' | 'longpress' | 'fling' = mayTriggerKind
    const state = publicState()

    if (start) {
      const dx = curr.x - start.x
      const dy = curr.y - start.y
      const distanceHit = Math.hypot(dx, dy) >= triggerThreshold
      const longPressHit = isLongPressing.value && (requiresMoveForLongPress ? distanceHit : true)
      if (longPressHit) {
        direction.value = computeDir(dx, dy)
        kind = 'longpress'
        hit = true
      } else if (distanceHit) {
        direction.value = computeDir(dx, dy)
        kind = 'threshold'
        hit = true
      } else if (kind === 'fling') {
        hit = true
      }

      // 最终方向守卫
      if (hit && direction.value && options.directionGuard && !options.directionGuard(direction.value as Exclude<Dir, null>, state)) {
        hit = false
        kind = null
      }
    }

    options.onEnd?.(e, state)
    options.onRelease?.(hit, hit ? (direction.value as Dir) : null, hit ? kind : null, state)
    // 未命中则自动复位
    if (!hit) {
      options.onReset?.(state)
    }
    const el = boundEl
    if (el) {
      removePointerEvents(el)
    }
    resetInternal()
  }

  function onPointerCancel(e: PointerEvent) {
    const state = publicState()
    options.onCancel?.(e, state)
    options.onReset?.(state)
    const el = boundEl
    if (el) {
      removePointerEvents(el)
    }
    resetInternal()
  }

  function onContextMenu(e: MouseEvent) {
    if (isActive.value) {
      e.preventDefault()
      e.stopPropagation()
    }
  }

  function removePointerEvents(el: HTMLElement) {
    el.removeEventListener('pointermove', onPointerMove, true)
    el.removeEventListener('pointerup', onPointerUp, true)
    el.removeEventListener('pointercancel', onPointerCancel, true)
  }

  function bind(el: Nullable<HTMLElement>) {
    unbind(el)

    if (!el) {
      return
    }

    el.addEventListener('contextmenu', onContextMenu)
    el.addEventListener('pointerdown', onPointerDown)
  }

  function unbind(el?: HTMLElement | null) {
    const _el = el ?? toValue(container)

    if (!_el) {
      return
    }

    removePointerEvents(_el)
    _el.removeEventListener('pointerdown', onPointerDown)
    _el.removeEventListener('contextmenu', onContextMenu)
  }

  function reset() {
    options.onReset?.(publicState())
    resetInternal()
  }

  // 为保持兼容：cancel 等价为 reset + onCancel(null)
  function cancel() {
    const state = publicState()
    options.onCancel?.(null, state)
    options.onReset?.(state)
    resetInternal()
  }

  const unwatchContainer = watch(
    () => toValue(container),
    (el, prev) => {
      if (el === prev) {
        return
      }

      bind(el!)
    },
    { immediate: true },
  )

  const stop = () => {
    unwatchContainer()
    resetInternal()
    unbind()
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    isActive,
    isDragging,
    isLongPressing,
    direction,
    delta,
    velocity,
    progress,
    reset,
    cancel,
    stop,
  }
}
