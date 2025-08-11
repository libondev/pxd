import type { EmitFn } from 'vue'
import { computed, shallowRef, watch } from 'vue'

// 常量定义
const UPDATE_INTERVAL = 34
const MILLISECOND_LENGTH = 13

// 类型定义
export interface Options {
  /**
   * 是否启用正计时
   * Whether to enable count up mode.
   * @default false
   */
  invert?: boolean
  /**
   * 是否激活
   * Whether the countdown is active.
   * @default false
   */
  active?: boolean
  /**
   * 结束时间
   * The end time of the countdown.
   */
  endTime?: number
  /**
   * 是否自动重置
   * Whether to automatically reset.
   * @default true
   */
  autoReset?: boolean
  /**
   * 倒计时时间
   * The duration of the countdown.
   * @default 0
   */
  durations?: number
  /**
   * 精度
   * The precision of the countdown.
   * @default 0
   */
  precision?: number
  /**
   * 是否使用毫秒
   * Whether the time stamp is in milliseconds.
   * @default true
   */
  millisecond?: boolean
}

// 工具函数
function normalizeEndTime(endTime: number): number {
  return String(endTime).length >= MILLISECOND_LENGTH ? endTime : endTime * 1000
}

function normalizeDuration(duration: number, millisecond: boolean = true): number {
  return millisecond ? Math.round(duration) : Math.round(duration * 1000)
}

// 计时器状态管理
interface TimerState {
  startTime: number
  isFinished: boolean
  isPaused: boolean
}

// 主函数
export function useCountdown<T extends Record<string, any>>(
  props: Options,
  emits: EmitFn<T>,
) {
  // 状态
  const state: TimerState = {
    startTime: -1,
    isFinished: false,
    isPaused: false,
  }

  // 响应式数据
  const distanceRef = shallowRef<number>(0)
  const durationRef = computed(() => {
    const { endTime, durations = 0, millisecond, invert } = props

    if (endTime) {
      const end = normalizeEndTime(endTime) - Date.now()
      return invert ? Math.max(0, -end) : Math.max(0, end)
    }

    const time = normalizeDuration(durations, millisecond)
    return Math.max(0, time)
  })

  // 计算距离
  function getCurrentDistance(currentTime: DOMHighResTimeStamp): number {
    if (props.invert) {
      return currentTime - state.startTime
    }
    return durationRef.value + state.startTime - currentTime
  }

  function setInitialDistance() {
    distanceRef.value = props.invert ? 0 : durationRef.value
  }

  // 检查是否完成
  function checkFinish(distance: number): boolean {
    const { durations, invert } = props

    if (invert) {
      return durations !== undefined && durations > 0 && distance >= durations
    }

    return distance <= 0
  }

  function reset() {
    state.startTime = performance.now()
    state.isFinished = false
    state.isPaused = false
    setInitialDistance()

    emits('reset')

    if (props.active) {
      startFrameLoop()
    }
  }

  let previousFrameTime = 0
  function startFrameLoop(timestamp?: DOMHighResTimeStamp) {
    const currentTime = performance.now()
    const distance = getCurrentDistance(currentTime)
    let isLastFrame = false

    if (state.isPaused) {
      if (distance < UPDATE_INTERVAL) {
        isLastFrame = true
      } else {
        return
      }
    }

    if (currentTime - previousFrameTime < UPDATE_INTERVAL && !isLastFrame) {
      requestAnimationFrame(startFrameLoop)
      return
    }

    previousFrameTime = timestamp || currentTime

    if (checkFinish(distance)) {
      onFinish()
      return
    }

    distanceRef.value = Math.max(0, distance)
    requestAnimationFrame(startFrameLoop)
  }

  function onFinish() {
    const { durations, invert } = props

    if (invert && durations !== undefined && durations > 0) {
      distanceRef.value = durations
    } else if (!invert) {
      distanceRef.value = 0
    }

    state.isFinished = true
    emits('finish')
  }

  function onActiveChange(isActive: boolean) {
    emits('change', isActive)

    if (isActive) {
      if (state.isPaused) {
        state.startTime = performance.now() - distanceRef.value
      } else {
        state.startTime = performance.now()
        // 确保正计时从0开始
        if (props.invert) {
          distanceRef.value = 0
        }
      }

      state.isPaused = false

      if (state.isFinished && props.autoReset) {
        reset()
      } else if (state.isFinished) {
        return
      }

      startFrameLoop()
    } else {
      state.isPaused = true
    }
  }

  // 时间参数变化处理
  function onTimeChange() {
    setInitialDistance()
    state.isFinished = false

    if (props.active) {
      reset()
    }
  }

  const unwatchActive = watch(
    () => props.active,
    isActive => onActiveChange(isActive || false),
  )

  const unwatchTimes = watch(
    () => [props.durations, props.endTime],
    () => onTimeChange(),
  )

  function clean() {
    unwatchTimes()
    unwatchActive()
  }

  setInitialDistance()

  return {
    clean,
    reset,
    timestamp: distanceRef,
  }
}
