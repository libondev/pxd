import type { EmitFn } from 'vue'
import { computed, shallowRef, watch } from 'vue'

const UPDATE_INTERVAL = 100 // 100ms = 10fps

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
   * 开始时间于
   * The start time of the countdown.
   */
  startAt?: number
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
  /**
   * 是否启用人性化时间显示（向上取整到秒）
   * Whether to enable human-friendly time display (ceil to seconds).
   * @default false
   */
  intuitive?: boolean
}

export function useCountdown<T extends Record<string, any>>(
  props: Options,
  emits: EmitFn<T>,
) {
  let startTimestamp = -1
  let isFinished = false
  let isPaused = false
  let previousFrameTime = 0

  const timeRef = shallowRef<number>(0)

  const totalDuration = computed(() => {
    const { endTime, durations } = props

    if (endTime) {
      const end = formatTime(endTime) - Date.now()
      return Math.max(0, end)
    }

    // 如果是正计时模式且没有设置 durations，支持无限计时
    if (props.invert && [undefined, 0].includes(durations)) {
      return Infinity
    }

    return Math.max(0, formatTime(durations ?? 0))
  })

  const isInfiniteCountup = computed(() =>
    props.invert && totalDuration.value === Infinity,
  )

  function formatTime(time: number = 0): number {
    return props.millisecond ? Math.round(time) : Math.round(time * 1000)
  }

  // 获取当前计时值
  function getCurrent(now: DOMHighResTimeStamp): number {
    const rawCurrent = props.invert
      ? now - startTimestamp
      : totalDuration.value + startTimestamp - now

    // 将毫秒转换为秒，向上取整，然后转回毫秒
    if (props.intuitive && !props.invert && rawCurrent > 0) {
      const seconds = Math.ceil(rawCurrent / 1000)
      return Math.max(0, seconds * 1000)
    }

    return rawCurrent
  }

  function setCurrent(): void {
    const startAtValue = formatTime(props.startAt)

    if (props.invert) {
      // 正计时模式：从 startAt 开始计时
      timeRef.value = isInfiniteCountup.value
        ? startAtValue
        : Math.min(startAtValue, totalDuration.value)
    } else {
      // 倒计时模式：从 totalDuration - startAt 开始倒计时
      const rawTime = Math.max(0, totalDuration.value - startAtValue)

      // 如果设置了 intuitive 则对初始值也进行向上取整处理
      if (props.intuitive && rawTime > 0) {
        const seconds = Math.ceil(rawTime / 1000)
        timeRef.value = Math.max(0, seconds * 1000)
      } else {
        timeRef.value = rawTime
      }
    }
  }

  function shouldFinish(current: number): boolean {
    if (!props.invert) {
      if (props.intuitive) {
        const actualCurrent = totalDuration.value + startTimestamp - performance.now()
        return actualCurrent <= 0
      }

      return current <= 0
    }

    return !isInfiniteCountup.value && current >= totalDuration.value
  }

  function finish(): void {
    timeRef.value = props.invert ? totalDuration.value : 0
    isFinished = true
    emits('finish')
  }

  function reset(): void {
    startTimestamp = performance.now() - formatTime(props.startAt)
    isFinished = false
    isPaused = false
    setCurrent()
    emits('reset')

    if (props.active) {
      frame()
    }
  }

  function frame(): void {
    const now = performance.now()
    const current = getCurrent(now)
    let isLastFrame = false

    if (isPaused) {
      if (shouldFinish(current)) {
        isLastFrame = true
      } else {
        return
      }
    }

    if (now - previousFrameTime < UPDATE_INTERVAL && !isLastFrame) {
      requestAnimationFrame(frame)
      return
    }

    previousFrameTime = now

    if (shouldFinish(current)) {
      finish()
      return
    }

    if (props.invert) {
      timeRef.value = isInfiniteCountup.value
        ? current
        : Math.min(current, totalDuration.value)
    } else {
      timeRef.value = Math.max(0, current)
    }

    requestAnimationFrame(frame)
  }

  const unwatchActive = watch(
    () => props.active,
    (isActive) => {
      emits('change', isActive)

      if (isActive) {
        if (isPaused) {
          const elapsed = props.invert ? timeRef.value : totalDuration.value - timeRef.value
          startTimestamp = performance.now() - elapsed
        } else {
          startTimestamp = performance.now() - formatTime(props.startAt)
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
    () => [props.durations, props.endTime, props.startAt],
    () => {
      setCurrent()
      isFinished = false
      if (props.active) {
        reset()
      }
    },
    { immediate: true },
  )

  function stop(): void {
    unwatchTimes()
    unwatchActive()
  }

  return {
    stop,
    reset,
    timestamp: timeRef,
  }
}
