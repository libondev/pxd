import { computed, onBeforeUnmount, shallowRef, watch } from 'vue'

export interface BaseOptions {
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

interface CountdownEvents {
  onStart?: () => void
  onPause?: () => void
  onReset?: () => void
  onFinish?: () => void
}

export interface Options extends BaseOptions, CountdownEvents {}

interface CountDownTimeInfo {
  dd: number
  hh: number
  mm: number
  ss: number
  ms: number
}

export function useCountdown(props: Options) {
  let pnow = -1
  let timerId: ReturnType<typeof setTimeout> | null = null
  let finished = false

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

  function getDelay(precision: number, distance: number): number {
    // When the distance is very close, it will be completed immediately.
    // If it is less than the minimum time, it will be completed immediately.
    if (distance <= 0 || distance <= UPDATE_INTERVAL) {
      return 0
    }

    switch (precision) {
      case 3:
        return UPDATE_INTERVAL
      case 2:
        return Math.min(Math.max(UPDATE_INTERVAL, distance % 10), 100)
      case 1:
        return Math.min(Math.max(UPDATE_INTERVAL, distance % 100), 1000)
      default:
        return Math.min(Math.max(UPDATE_INTERVAL, distance % 1000), 1000)
    }
  }

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

  function stopTimer() {
    if (timerId) {
      clearTimeout(timerId)
      timerId = null
    }
  }

  function reset() {
    setDistance()
    pnow = performance.now()
    finished = false
    stopTimer()

    if (props.active) {
      frame()
    }
  }

  function frame() {
    const distance = getDistance(performance.now())

    if (distance <= 0) {
      distanceRef.value = 0
      finished = true
      stopTimer()

      props.onFinish?.()
      return
    }

    distanceRef.value = Math.max(0, distance)
    const delay = getDelay(props.precision ?? 0, distance)

    if (delay > 0) {
      timerId = setTimeout(frame, delay)
    } else {
      requestAnimationFrame(frame)
    }
  }

  const unwatchActive = watch(
    () => props.active,
    (isActive) => {
      if (isActive) {
        pnow = performance.now()

        if (finished && props.autoReset) {
          reset()
        } else if (finished) {
          return
        }

        frame()
      } else {
        stopTimer()
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
    stopTimer()
    unwatchTimes()
    unwatchActive()
  })

  return {
    reset,
    times,
  }
}
