// Inline "any-touch" to resolve the warning that sourcemap is not in the workspace

type KV = Record<string, any>

type SupportElement = HTMLElement | SVGElement

/** 输入阶段 */
type phase = 'start' | 'move' | 'end' | 'cancel'

/** 方向 */
type directionString = 'up' | 'right' | 'down' | 'left' | 'none'

/** 点 */
interface Point {
  x: number
  y: number
}

type Vector = Point

interface PointClientXY {
  target: EventTarget | null
  clientX: number
  clientY: number
}

/** 原生事件上选取的共有字段 */
interface PubicEvent {
  readonly phase: phase
  readonly changedPoints: PointClientXY[]
  readonly points: PointClientXY[]
  readonly target: EventTarget | null
  readonly targets: (EventTarget | null)[]
  readonly nativeEvent: Event
}

/** 不包含prevInput/startInput/startMultiInput的Input */
interface InputOnlyHasCurrent extends PubicEvent {
  readonly id: number
  readonly isStart: boolean
  readonly isEnd: boolean
  readonly pointLength: number
  readonly timestamp: number
  readonly currentTarget: EventTarget | null
  readonly center?: Point
  readonly x: number
  readonly y: number
  readonly getOffset: (el: HTMLElement) => { x: number; y: number }
}

/** 提供给插件(compute函数)之前的统一化数据 */
interface Input extends InputOnlyHasCurrent {
  readonly startInput: InputOnlyHasCurrent
  readonly startMultiInput?: InputOnlyHasCurrent
  readonly prevInput?: InputOnlyHasCurrent
}

/** Input执行计算后的数据格式 */
interface Computed extends KV {
  readonly maxPointLength?: number
  readonly velocityX?: number
  readonly velocityY?: number
  readonly speedX?: number
  readonly speedY?: number
  readonly scale?: number
  readonly deltaScale?: number
  readonly angle?: number
  readonly deltaAngle?: number
  readonly deltaX?: number
  readonly deltaY?: number
  readonly deltaXYAngle?: number
  readonly displacementX?: number
  readonly displacementY?: number
  readonly distanceX?: number
  readonly distanceY?: number
  readonly distance?: number
  readonly deltaTime?: number
  readonly overallDirection?: directionString
  readonly direction?: directionString
  readonly startVecotr?: Vector
  readonly prevVecotr?: Vector
  readonly activeVecotr?: Vector
}

interface AnyTouchEvent extends Input, Required<Computed> {
  readonly type: string
  readonly stopPropagation: () => void
  readonly stopImmediatePropagation: () => void
  readonly preventDefault: () => void
}

/** 适配器支持的事件类型 */
type NativeEvent = MouseEvent | TouchEvent

interface Options {
  domEvents?: false | EventInit
  preventDefault?: boolean | ((e: NativeEvent) => boolean)
}

/** 计算函数 */
type ComputeFunction = (input: Input, computed: Partial<Computed>) => Computed | void

/** 计算函数生成器 */
type ComputeFunctionCreator = () => ComputeFunction

/** 识别器状态 */
const STATE = {
  POSSIBLE: 0,
  RECOGNIZED: 1,
  FAILED: 2,
  CANCELLED: 3,
  START: 4,
  MOVE: 5,
  END: 1,
} as const

type STATE = (typeof STATE)[keyof typeof STATE]
type RECOGNIZER_STATE = STATE

type PluginOptions = { name?: string } & KV

type PluginContext<D extends Required<PluginOptions> = Required<PluginOptions>> = {
  state: RECOGNIZER_STATE
  disabled: boolean
} & D

type Plugin = (context: Core, pluginOptions?: PluginOptions) => PluginContext

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
  ? I
  : never

interface DefaultTypeAndEventMap {
  [type: string]: any
}

type AEventListener<Event, Key> = (event: Event, key: Key) => void

interface Interceptor {
  (type: string | number | symbol, next: () => void): void
}

interface PluginContextMap {
  pan: PanContext
}

interface EventMap {
  input: Input
  computed: Record<string, any>
  u: undefined
  'at:after': Computed
  'at:start': Input
  'at:move': Input
  'at:cancel': Input
  'at:end': Input
  pan: AnyTouchEvent
  panstart: AnyTouchEvent
  panmove: AnyTouchEvent
  panend: AnyTouchEvent
  pancancel: AnyTouchEvent
  panup: AnyTouchEvent
  pandown: AnyTouchEvent
  panright: AnyTouchEvent
  panleft: AnyTouchEvent
}

type GetPluginContext<N> = N extends keyof PluginContextMap
  ? PluginContextMap[N]
  : PluginContext | undefined

type PanContext = PluginContext & typeof PAN_DEFAULT_OPTIONS

/**
 * ========================================
 * 常量
 * ========================================
 */

const CLIENT_X = 'clientX' as const
const CLIENT_Y = 'clientY' as const
const PHASE_START = 'start' as const
const DIRECTION_LEFT = 'left' as const
const DIRECTION_RIGHT = 'right' as const
const DIRECTION_DOWN = 'down' as const

const STATE_MAP: Record<number, string> = {
  [STATE.START]: 'start',
  [STATE.MOVE]: 'move',
  [STATE.END]: 'end',
  [STATE.CANCELLED]: 'cancel',
}

const TOUCH_EVENTS = ['touchstart', 'touchmove', 'touchend', 'touchcancel', 'mousedown'] as const
const MOUSE_EVENTS = ['mousemove', 'mouseup'] as const

const DEFAULT_OPTIONS: Options = {
  domEvents: { bubbles: true, cancelable: true },
  preventDefault: (e: NativeEvent) => {
    if (e.target && 'tagName' in e.target) {
      const { tagName } = e.target as HTMLElement
      return !/^(?:INPUT|TEXTAREA|BUTTON|SELECT)$/.test(tagName)
    }
    return false
  },
}

const PAN_DEFAULT_OPTIONS = {
  name: 'pan',
  threshold: 10,
  pointLength: 1,
}

/**
 * ========================================
 * 工具函数 (来自 @any-touch/shared)
 * ========================================
 */

/** 状态码转阶段名 */
function stateToPhase(state: number): string | undefined {
  return STATE_MAP[state]
}

/** 有限状态机 - 根据是否识别和当前阶段计算下一个状态 */
function computeFSM(isRecognized: boolean, state: number, phase: string): number {
  const table: Record<number, Record<number, Record<string, number>>> = {
    // 已识别
    1: {
      0: { move: STATE.START },
      4: { move: STATE.MOVE, end: STATE.END, cancel: STATE.CANCELLED },
      5: { move: STATE.MOVE, end: STATE.END, cancel: STATE.CANCELLED },
    },
    // 未识别
    0: {
      4: { move: STATE.RECOGNIZED, end: STATE.END, cancel: STATE.CANCELLED },
      5: {
        start: STATE.RECOGNIZED,
        move: STATE.RECOGNIZED,
        end: STATE.END,
        cancel: STATE.CANCELLED,
      },
    },
  }
  const transitions = table[Number(isRecognized)]?.[state]
  return (transitions !== undefined && transitions[phase]) || 0
}

/** 如果上一次状态是end/cancel/failed, 重置为possible */
function resetIfTerminalState(context: PluginContext): void {
  if (([STATE.END, STATE.CANCELLED, STATE.FAILED] as STATE[]).includes(context.state as STATE)) {
    context.state = STATE.POSSIBLE
  }
}

/** 判断是否是终止状态(start/move/end对应的状态) */
function isEndOrCancelState(state: number): boolean {
  return ([STATE.MOVE, STATE.END, STATE.CANCELLED] as number[]).includes(state)
}

/** 如果插件被禁用, 重置状态并返回true */
function abortIfDisabled(context: PluginContext): boolean | undefined {
  if (context.disabled) {
    context.state = STATE.POSSIBLE
    return true
  }
}

/** 创建插件上下文, 合并默认选项和用户选项 */
function createPluginContext<T>(defaults: T, options?: Partial<T>): PluginContext & T {
  return { ...defaults, ...options, state: STATE.POSSIBLE, disabled: false } as PluginContext & T
}

/** 向量长度 */
function vectorLength(v: Point): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/** 弧度转角度 */
function radToDeg(rad: number): number {
  return (rad / Math.PI) * 180
}

/** 根据deltaX/deltaY计算方向 */
function computeDirection(deltaX: number, deltaY: number): directionString | undefined {
  if (deltaX !== 0 || deltaY !== 0) {
    return Math.abs(deltaX) >= Math.abs(deltaY)
      ? deltaX > 0
        ? DIRECTION_RIGHT
        : DIRECTION_LEFT
      : deltaY > 0
        ? DIRECTION_DOWN
        : 'up'
  }
}

/**
 * ========================================
 * AnyEvent 基类 (来自 any-event)
 * ========================================
 */

class AnyEvent<TypeAndEventMap extends DefaultTypeAndEventMap = DefaultTypeAndEventMap> {
  private __map: Record<string, AEventListener<any, any>[]> = {}
  private __interceptor?: Interceptor

  /** 当前事件对象 */
  event: unknown

  /** 注册拦截器 */
  beforeEach(interceptor: Interceptor): void {
    this.__interceptor = interceptor
  }

  /** 绑定事件 */
  on<Key extends keyof TypeAndEventMap>(
    typeOrTypes: Key | Key[],
    listener: AEventListener<TypeAndEventMap[Key], Key>,
  ): this {
    const types = Array.isArray(typeOrTypes) ? typeOrTypes : [typeOrTypes]
    for (const type of types) {
      this.__map[type as string] = this.__map[type as string] || []
      const list = this.__map[type as string]
      if (list) {
        list.push(listener)
      }
    }
    return this
  }

  /** 触发事件 */
  emit<Key extends keyof TypeAndEventMap>(
    type: Key,
    payload?: TypeAndEventMap[Key],
    callback?: () => void,
  ): void {
    if (this.__interceptor === undefined) {
      this.__doEmit(type, payload)
      callback?.()
    } else {
      this.__interceptor(type, () => {
        this.__doEmit(type, payload)
        callback?.()
      })
    }
  }

  private __doEmit<Key extends keyof TypeAndEventMap>(
    type: Key,
    payload?: TypeAndEventMap[Key],
  ): void {
    const list = this.__map[type as string]
    if (Array.isArray(list) && list?.length) {
      for (const listener of list) {
        listener(payload, type)
      }
    }
    this.event = payload
  }

  /** 解除绑定 */
  off<Key extends keyof TypeAndEventMap>(
    type: Key,
    listener?: AEventListener<TypeAndEventMap[Key], Key>,
  ): void {
    const list = this.__map[type as string]
    if (list !== undefined) {
      if (listener === undefined) {
        delete this.__map[type as string]
      } else {
        const index = list.findIndex((l) => l === listener)
        list.splice(index, 1)
      }
    }
  }

  /** 销毁实例 */
  destroy(): void {
    this.__map = {}
  }
}

/**
 * ========================================
 * Input 适配器 (来自 @any-touch/core)
 * ========================================
 */

/** 从一组触点中计算中心点 */
function getCenter(points: PointClientXY[]): { x: number; y: number } | undefined {
  const { length } = points
  if (length > 0) {
    if (length === 1) {
      const { clientX, clientY } = points[0]
      return { x: Math.round(clientX), y: Math.round(clientY) }
    }
    const sum = points.reduce(
      (acc, p) => {
        acc.x += p[CLIENT_X]
        acc.y += p[CLIENT_Y]
        return acc
      },
      { x: 0, y: 0 },
    )
    return { x: Math.round(sum.x / length), y: Math.round(sum.y / length) }
  }
}

/** Input构造器工厂 - 为每次触摸/鼠标事件生成标准化Input */
function createInputCreator(): (rawInput: Partial<Input> | undefined) => Input | undefined {
  let prevInput: Input | undefined
  let currentInput: Input | undefined
  let startInput: InputOnlyHasCurrent | undefined
  let startMultiInput: InputOnlyHasCurrent | undefined
  let id = 0

  return function (rawInput: Partial<Input> | undefined): Input | undefined {
    prevInput = currentInput
    if (rawInput !== undefined) {
      id = Number.MAX_SAFE_INTEGER > id ? ++id : 1
      const enriched = enrichInput(rawInput, id)
      currentInput = enriched
      const { isStart, pointLength } = enriched
      if (isStart) {
        startInput = enriched as InputOnlyHasCurrent
        prevInput = undefined
        startMultiInput = pointLength > 1 ? (enriched as InputOnlyHasCurrent) : undefined
      }
      return {
        ...enriched,
        prevInput,
        startMultiInput,
        startInput: startInput!,
      }
    }
  }
}

/** 给原始input添加计算后的字段 */
function enrichInput(rawInput: Partial<Input>, id: number): Input {
  const { phase, points, changedPoints, nativeEvent } = rawInput
  const pointLength = points!.length
  const isStart = PHASE_START === phase
  const isEnd = (phase === 'end' && pointLength === 0) || phase === 'cancel'
  const timestamp = Date.now()
  const center = getCenter(points!) || getCenter(changedPoints!)
  const { currentTarget } = nativeEvent as Event

  return Object.assign(rawInput, {
    id,
    x: center!.x,
    y: center!.y,
    timestamp,
    isStart,
    isEnd,
    pointLength,
    currentTarget,
    getOffset(el: HTMLElement = currentTarget as HTMLElement) {
      const rect = el.getBoundingClientRect()
      return {
        x: center!.x - Math.round(rect.left),
        y: center!.y - Math.round(rect.top),
      }
    },
  }) as Input
}

/** Touch事件适配器工厂 */
function createTouchInputCreator(el: SupportElement): (event: TouchEvent) => Input | undefined {
  const inputCreator = createInputCreator()
  return function (event: TouchEvent): Input | undefined {
    const targets: EventTarget[] = []
    const points: PointClientXY[] = []
    Array.from(event.touches).forEach(({ clientX, clientY, target }) => {
      if (el?.contains(target as Node)) {
        targets.push(target)
        points.push({ clientX, clientY, target })
      }
    })
    const changedPoints = Array.from(event.changedTouches).map(({ clientX, clientY, target }) => ({
      clientX,
      clientY,
      target,
    }))
    return inputCreator({
      phase: event.type.replace('touch', '') as phase,
      changedPoints,
      points,
      nativeEvent: event,
      target: event.target,
      targets,
    } as unknown as Partial<Input>)
  }
}

/** Mouse事件适配器工厂 */
function createMouseInputCreator(): (event: MouseEvent) => Input | undefined {
  let prevPoint: PointClientXY[] | undefined
  let isMouseDown = false
  let mouseTarget: EventTarget | null = null
  const inputCreator = createInputCreator()

  return function (event: MouseEvent): Input | undefined {
    const { clientX, clientY, type, button, target } = event
    let phaseStr: string | undefined
    let points: PointClientXY[] = [{ clientX, clientY, target }]

    if (type === 'mousedown' && button === 0) {
      mouseTarget = target
      isMouseDown = true
      phaseStr = 'start'
    } else {
      if (!isMouseDown) {
        return
      }
      if (type === 'mousemove') {
        phaseStr = 'move'
      } else if (type === 'mouseup') {
        points = []
        phaseStr = 'end'
        isMouseDown = false
      }
    }

    const changedPoints = prevPoint || [{ clientX, clientY, target }]
    prevPoint = [{ clientX, clientY, target }]

    if (phaseStr !== undefined) {
      return inputCreator({
        phase: phaseStr as phase,
        changedPoints,
        points,
        target: mouseTarget,
        targets: [mouseTarget],
        nativeEvent: event,
      } as unknown as Partial<Input>)
    }
  }
}

/**
 * ========================================
 * DOM 事件分发 (来自 @any-touch/core)
 * ========================================
 */

/** 分发自定义DOM事件 */
function dispatchDomEvent(
  type: string,
  el: EventTarget,
  computed: Computed & { targets?: (EventTarget | null)[]; __type?: string },
  eventInit?: EventInit,
): boolean {
  const payload: Record<string, any> = {}
  for (const key in computed) {
    if (!['target', 'currentTarget', 'type'].includes(key)) {
      payload[key] = (computed as any)[key]
    }
  }
  let event: Event
  if (document.createEvent) {
    event = document.createEvent('HTMLEvents')
    ;(event as any).initEvent(type, eventInit?.bubbles, eventInit?.cancelable)
  } else {
    event = new Event(type, eventInit)
  }
  Object.assign(event, payload, {
    match: () =>
      computed.targets &&
      computed.targets.length > 0 &&
      computed.targets.every((t: EventTarget | null) =>
        (event.currentTarget as Element).contains(t as Node),
      ),
  })
  return el.dispatchEvent(event)
}

/** 判断是否需要阻止默认事件 */
function shouldPreventDefault(e: NativeEvent, options: Options): boolean {
  const { preventDefault } = options
  if (typeof preventDefault === 'function') {
    return preventDefault(e)
  }
  return !!preventDefault
}

/**
 * ========================================
 * Core 核心类 (来自 @any-touch/core)
 * ========================================
 */

class Core extends AnyEvent<EventMap> {
  /** 版本 */
  v = '2.1.3'

  /** 当前绑定元素 */
  el?: SupportElement

  /** 当前插件上下文 */
  c?: PluginContext

  private __options: Options
  private __inputCreatorMap: Record<string, (event: any) => Input | undefined>
  private __computeFunctionList: ComputeFunction[] = []
  private __computeFunctionCreatorList: ComputeFunctionCreator[] = []
  private __pluginContexts: PluginContext[] = []
  private __isIgnoreMouse = false

  constructor(el?: SupportElement, options?: Options) {
    super()
    this.el = el
    this.c = {} as PluginContext
    this.__options = { ...DEFAULT_OPTIONS, ...options }

    const touchInputCreator = createTouchInputCreator(this.el!)
    const mouseInputCreator = createMouseInputCreator()

    this.__inputCreatorMap = {
      touchstart: touchInputCreator,
      touchmove: touchInputCreator,
      touchend: touchInputCreator,
      touchcancel: touchInputCreator,
      mousedown: mouseInputCreator,
      mousemove: mouseInputCreator,
      mouseup: mouseInputCreator,
    }

    this.on('at:after', (e: any) => {
      const { target, __type } = e
      const { domEvents } = this.__options
      if (domEvents && this.el !== undefined && target) {
        dispatchDomEvent(__type, target, e, domEvents)
        dispatchDomEvent('at:after', target, e, domEvents)
      }
    })

    if (el !== undefined) {
      ;(el.style as any).webkitTapHighlightColor = 'rgba(0,0,0,0)'

      let supportsPassive = false
      try {
        const opts = {}
        Object.defineProperty(opts, 'passive', {
          get() {
            supportsPassive = true
          },
        })
        window.addEventListener('_', () => {}, opts as any)
      } catch {}

      this.on(
        'u' as any,
        bindEvents(
          el,
          this.catchEvent.bind(this) as (e: Event) => void,
          this.__options.preventDefault === false && supportsPassive
            ? { passive: true }
            : { passive: false },
        ),
      )
    }
  }

  /** 加载并初始化插件 */
  use<P extends Plugin>(plugin: P, pluginOptions?: Parameters<P>[1]): void {
    this.__pluginContexts.push(plugin(this, pluginOptions))
  }

  /** 监听input变化 */
  catchEvent(event: NativeEvent): void {
    const input = this.__inputCreatorMap[event.type](event)
    if (input !== undefined) {
      const stopPropagation = () => event.stopPropagation()
      const stopImmediatePropagation = () => event.stopImmediatePropagation()
      const preventDefault = () => event.preventDefault()

      if (shouldPreventDefault(event, this.__options)) {
        preventDefault()
      } else if (event.type === 'touchstart') {
        this.__isIgnoreMouse = true
      } else if (event.type === 'touchmove') {
        this.__isIgnoreMouse = false
      }

      if (this.__isIgnoreMouse && event.type.startsWith('mouse')) {
        if (event.type === 'mouseup') {
          this.__isIgnoreMouse = false
        }
        return
      }

      this.emit('input', input as any)
      this.emit2(`at:${input.phase}`, input as any, {} as PluginContext)

      const computed: Record<string, any> = {}
      this.__computeFunctionList.forEach((fn) => {
        const result = fn(input, computed as Partial<Computed>)
        if (result !== undefined) {
          for (const key in result) {
            computed[key] = (result as any)[key]
          }
        }
      })

      this.emit('computed', {
        ...input,
        ...computed,
        stopPropagation,
        stopImmediatePropagation,
        preventDefault,
      } as any)
    }
  }

  /** 缓存计算函数生成器到队列 */
  compute<CList extends ComputeFunctionCreator[] = ComputeFunctionCreator[]>(
    computeFunctionCreatorList: CList,
    callback: (computed: UnionToIntersection<ReturnType<ReturnType<CList[0]>>> & Input) => void,
  ): void {
    for (const creator of computeFunctionCreatorList) {
      if (!this.__computeFunctionCreatorList.includes(creator)) {
        this.__computeFunctionCreatorList.push(creator)
        this.__computeFunctionList.push(creator())
      }
    }
    this.on('computed' as any, callback as any)
  }

  /** 拦截器 */
  beforeEach(interceptor: (type: string, next: () => void) => void): void {
    super.beforeEach((type, next) => {
      if (this.c?.name) {
        interceptor(type as string, next)
      } else {
        next()
      }
    })
  }

  /** 获取识别器通过名字 */
  get<N extends keyof PluginContextMap>(name: N): GetPluginContext<N> {
    return this.__pluginContexts.find((ctx) => name === ctx.name) as GetPluginContext<N>
  }

  /** 设置选项 */
  set(newOptions: Partial<Options>): void {
    this.__options = { ...this.__options, ...newOptions }
  }

  /** 带DOM事件的emit */
  emit2(type: string, payload: Computed, pluginContext: PluginContext): void {
    this.c = pluginContext
    this.emit(type as any, { ...payload, type } as any, () => {
      this.emit(
        'at:after' as any,
        {
          ...payload,
          name: type,
          __type: type,
        } as any,
      )
    })
  }

  /** 销毁 */
  destroy(): void {
    this.emit('u' as any)
    super.destroy()
  }
}

/** 绑定/解绑 Touch + Mouse 事件 */
function bindEvents(
  el: SupportElement,
  handler: (e: Event) => void,
  options: AddEventListenerOptions,
): () => void {
  TOUCH_EVENTS.forEach((type) => {
    el.addEventListener(type, handler, options)
  })
  MOUSE_EVENTS.forEach((type) => {
    window.addEventListener(type, handler, options)
  })
  return () => {
    TOUCH_EVENTS.forEach((type) => {
      el.removeEventListener(type, handler)
    })
    MOUSE_EVENTS.forEach((type) => {
      window.removeEventListener(type, handler)
    })
  }
}

/**
 * ========================================
 * 计算函数 (来自 @any-touch/compute)
 * ========================================
 */

/** 计算deltaX, deltaY, deltaXYAngle */
function createComputeDeltaXY(): ComputeFunction {
  return function (input) {
    const { prevInput } = input
    let deltaX = 0
    let deltaY = 0
    let deltaXYAngle = 0
    if (prevInput !== undefined) {
      deltaX = input.x - prevInput.x
      deltaY = input.y - prevInput.y
      if (deltaX !== 0 || deltaY !== 0) {
        const distance = Math.sqrt(deltaX ** 2 + deltaY ** 2)
        deltaXYAngle = Math.round(radToDeg(Math.acos(Math.abs(deltaX) / distance)))
      }
    }
    return { deltaX, deltaY, deltaXYAngle } as Computed
  }
}

/** 计算位移、距离、总体方向 */
function createComputeDistance(): ComputeFunction {
  let overallDirection: directionString | undefined
  let displacementX = 0
  let displacementY = 0
  let distanceX = 0
  let distanceY = 0
  let distance = 0

  return function (input) {
    const { phase, startInput } = input
    if (phase === 'start') {
      displacementX = 0
      displacementY = 0
      distanceX = 0
      distanceY = 0
      distance = 0
    } else if (phase === 'move') {
      displacementX = Math.round(input.points[0].clientX - startInput.points[0].clientX)
      displacementY = Math.round(input.points[0].clientY - startInput.points[0].clientY)
      distanceX = Math.abs(displacementX)
      distanceY = Math.abs(displacementY)
      distance = Math.round(vectorLength({ x: distanceX, y: distanceY }))
      overallDirection = computeDirection(displacementX, displacementY)
    }
    return {
      displacementX,
      displacementY,
      distanceX,
      distanceY,
      distance,
      overallDirection,
    } as Computed
  }
}

/** 计算速度、方向 */
function createComputeVelocity(): ComputeFunction {
  let direction: directionString | undefined
  let lastRecordInput: InputOnlyHasCurrent | undefined
  let velocityX = 0
  let velocityY = 0
  let speedX = 0
  let speedY = 0

  return function (input) {
    if (input !== undefined) {
      lastRecordInput ||= input.startInput
      const deltaTime = input.timestamp - lastRecordInput!.timestamp
      if (deltaTime > 16) {
        const deltaX = input.x - lastRecordInput!.x
        const deltaY = input.y - lastRecordInput!.y
        speedX = Math.round((deltaX / deltaTime) * 100) / 100
        speedY = Math.round((deltaY / deltaTime) * 100) / 100
        velocityX = Math.abs(speedX)
        velocityY = Math.abs(speedY)
        direction = computeDirection(deltaX, deltaY)
        lastRecordInput = input
      }
    }
    return {
      velocityX,
      velocityY,
      speedX,
      speedY,
      direction,
    } as Computed
  }
}

/**
 * ========================================
 * Pan 识别器 (来自 @any-touch/pan)
 * ========================================
 */

/** "拖拽"识别器 */
function Pan(at: Core, options?: Partial<typeof PAN_DEFAULT_OPTIONS>): PanContext {
  const context = createPluginContext(PAN_DEFAULT_OPTIONS, options) as PanContext

  at.compute(
    [createComputeVelocity, createComputeDistance, createComputeDeltaXY],
    (computed: any) => {
      resetIfTerminalState(context)
      if (abortIfDisabled(context)) {
        return
      }

      const isRecognized = (function () {
        const { pointLength, distance } = computed
        return context.pointLength === pointLength && context.threshold <= distance
      })()

      context.state = computeFSM(isRecognized, context.state, computed.phase) as STATE

      if (isRecognized || isEndOrCancelState(context.state)) {
        const { name } = context
        at.emit2(name, computed, context)
        at.emit2(name + stateToPhase(context.state)!, computed, context)
        if (!['end', 'cancel'].includes(computed.phase) && computed.direction) {
          at.emit2(name + computed.direction, computed, context)
        }
      }
    },
  )

  return context
}

export { Core, Pan }
