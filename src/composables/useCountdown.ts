import type { EmitFn } from 'vue'
import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'

export interface Options {
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

interface CountDownTimeInfo {
  dd: number
  hh: number
  mm: number
  ss: number
  ms: number
}

export function useCountdown<T extends Record<string, any>>(props: Options, emits: EmitFn<T>) {
  let pnow = -1
  let finished = false
  let isPaused = false

  const UPDATE_INTERVAL = 34
  const TIME_CONSTANTS = {
    DAY: 86400000,
    HOUR: 3600000,
    MINUTE: 60000,
    SECOND: 1000,
  }

  const distanceRef = shallowRef<number>(0)

  const durations = computed(() => {
    const { endTime, durations = 0, millisecond } = props

    if (endTime) {
      const end = (String(endTime).length >= 13 ? endTime : endTime * 1000) - Date.now()
      return Math.max(0, end)
    }

    const time = millisecond
      ? Math.round(durations)
      : Math.round(durations * 1000)

    return Math.max(0, time)
  })

  const times = computed(() => {
    const { dd, hh, mm, ss, ms } = getTimeInfo(distanceRef.value)
    const formatMs
      = props.precision === 0
        ? 0
        : Math.floor(
            ms / (props.precision === 1 ? 100 : props.precision === 2 ? 10 : 1),
          )

    return {
      dd: String(dd).padStart(2, '0'),
      hh: String(hh).padStart(2, '0'),
      mm: String(mm).padStart(2, '0'),
      ss: String(ss).padStart(2, '0'),
      ms: formatMs.toString().padStart(props.precision || 0, '0'),
    }
  })

  function getTimeInfo(time: number): CountDownTimeInfo {
    const dd = Math.floor(time / TIME_CONSTANTS.DAY)
    const hh = Math.floor((time % TIME_CONSTANTS.DAY) / TIME_CONSTANTS.HOUR)
    const mm = Math.floor((time % TIME_CONSTANTS.HOUR) / TIME_CONSTANTS.MINUTE)
    const ss = Math.floor((time % TIME_CONSTANTS.MINUTE) / TIME_CONSTANTS.SECOND)
    const ms = Math.floor(time % TIME_CONSTANTS.SECOND)

    return { dd, hh, mm, ss, ms }
  }

  function getDistance(time: DOMHighResTimeStamp): number {
    return durations.value + pnow - time
  }

  function setDistance() {
    distanceRef.value = durations.value
  }

  function finish() {
    distanceRef.value = 0
    finished = true

    emits('finish')
  }

  function reset() {
    pnow = performance.now()
    finished = false
    isPaused = false
    setDistance()

    emits('reset')

    if (props.active) {
      frame()
    }
  }

  let previousFrameTime = 0
  function frame(timestamp?: DOMHighResTimeStamp) {
    const distance = getDistance(performance.now())
    let isLastFrame = false

    if (isPaused) {
      if (distance < UPDATE_INTERVAL) {
        isLastFrame = true
      } else {
        return
      }
    }

    if (performance.now() - previousFrameTime < UPDATE_INTERVAL && !isLastFrame) {
      requestAnimationFrame(frame)
      return
    }

    previousFrameTime = timestamp!

    if (distance <= 0) {
      finish()
      return
    }

    distanceRef.value = Math.max(0, distance)

    requestAnimationFrame(frame)
  }

  const unwatchActive = watch(
    () => props.active,
    (isActive) => {
      emits('change', isActive)

      if (isActive) {
        if (isPaused) {
          pnow = performance.now() - durations.value + distanceRef.value
        } else {
          pnow = performance.now()
        }

        isPaused = false

        if (finished && props.autoReset) {
          reset()
        } else if (finished) {
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
      setDistance()
      finished = false

      if (props.active) {
        reset()
      }
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    unwatchTimes()
    unwatchActive()
  })

  return {
    reset,
    times,
  }
}
