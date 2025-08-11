import type { EmitFn } from 'vue'
import { computed, shallowRef, watch } from 'vue'

const UPDATE_INTERVAL = 34
const MILLISECOND_LENGTH = 13

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

export function useCountdown<T extends Record<string, any>>(
  props: Options,
  emits: EmitFn<T>,
) {
  let startTimestamp = -1
  let isFinished = false
  let isPaused = false

  const timeRef = shallowRef<number>(0)

  const totalDuration = computed(() => {
    const { endTime, durations = 0, millisecond } = props
    if (endTime) {
      const end = (String(endTime).length >= MILLISECOND_LENGTH ? endTime : endTime * 1000) - Date.now()
      return Math.max(0, end)
    }
    // 默认按“毫秒”解释；仅当 millisecond === false 时按“秒”转毫秒
    const time = millisecond === false ? Math.round(durations * 1000) : Math.round(durations)
    return Math.max(0, time)
  })

  // 获取当前计时（正计时为已过去，倒计时为剩余）
  function getCurrent(now: DOMHighResTimeStamp): number {
    return props.invert
      ? now - startTimestamp
      : totalDuration.value + startTimestamp - now
  }

  function setCurrent() {
    timeRef.value = props.invert ? 0 : totalDuration.value
  }

  function finish() {
    timeRef.value = props.invert ? totalDuration.value : 0
    isFinished = true
    emits('finish')
  }

  function reset() {
    startTimestamp = performance.now()
    isFinished = false
    isPaused = false
    setCurrent()
    emits('reset')

    if (props.active) {
      frame()
    }
  }

  let previousFrameTime = 0
  function frame(timestamp?: DOMHighResTimeStamp) {
    const now = performance.now()
    const current = getCurrent(now)
    let isLastFrame = false

    if (isPaused) {
      if ((!props.invert && current < UPDATE_INTERVAL) || (props.invert && current >= totalDuration.value)) {
        isLastFrame = true
      } else {
        return
      }
    }

    if (now - previousFrameTime < UPDATE_INTERVAL && !isLastFrame) {
      requestAnimationFrame(frame)
      return
    }

    previousFrameTime = timestamp!

    if ((!props.invert && current <= 0) || (props.invert && current >= totalDuration.value)) {
      finish()
      return
    }

    timeRef.value = props.invert
      ? Math.min(current, totalDuration.value)
      : Math.max(0, current)

    requestAnimationFrame(frame)
  }

  const unwatchActive = watch(
    () => props.active,
    (isActive) => {
      emits('change', isActive)
      if (isActive) {
        if (isPaused) {
          startTimestamp = performance.now() - (props.invert ? timeRef.value : totalDuration.value - timeRef.value)
        } else {
          startTimestamp = performance.now()
        }
        isPaused = false
        if (isFinished && props.autoReset) {
          reset()
        } else if (isFinished) {
          return
        }
        frame()
      } else {
        isPaused = true
      }
    },
    { immediate: true },
  )

  const unwatchTimes = watch(
    () => [props.durations, props.endTime],
    () => {
      setCurrent()
      isFinished = false
      if (props.active) {
        reset()
      }
    },
    { immediate: true },
  )

  function clean() {
    unwatchTimes()
    unwatchActive()
  }

  return {
    clean,
    reset,
    timestamp: timeRef,
  }
}
