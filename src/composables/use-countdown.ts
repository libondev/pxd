import type { EmitFn, Ref } from 'vue'
import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { caf, raf } from '../utils/event'

const UPDATE_INTERVAL = 100 // 100ms = 10fps

export interface CountdownOptions {
  /**
   * Whether to enable count up mode.
   * @default false
   */
  invert?: boolean
  /**
   * Whether the countdown is active.
   * @default false
   */
  active?: boolean
  /**
   * The start time of the countdown.
   */
  startAt?: number
  /**
   * The end time of the countdown.
   */
  endTime?: number
  /**
   * Whether to automatically reset.
   * @default true
   */
  autoReset?: boolean
  /**
   * The duration of the countdown.
   * @default 0
   */
  durations?: number
  /**
   * The precision of the countdown.
   * @default 0
   */
  precision?: number
  /**
   * Whether the time stamp is in milliseconds.
   * @default true
   */
  millisecond?: boolean
  /**
   * Whether to enable human-friendly time display (ceil to seconds).
   * @default false
   */
  intuitive?: boolean
}

interface Results {
  stop: () => void
  reset: () => void
  timestamp: Ref<number>
}

export function useCountdown<T extends Record<string, any>>(
  props: CountdownOptions,
  emits: EmitFn<T>,
): Results {
  let startTimestamp = -1
  let isFinished = false
  let isPaused = false
  let previousFrameTime = 0
  let rafId = 0

  const timeRef = shallowRef<number>(0)

  const totalDuration = computed(() => {
    const { endTime, durations } = props

    if (endTime) {
      const end = formatTime(endTime) - Date.now()
      return Math.max(0, end)
    }

    // In count-up mode with no durations, count up indefinitely.
    if (props.invert && [undefined, 0].includes(durations)) {
      return Infinity
    }

    return Math.max(0, formatTime(durations ?? 0))
  })

  const isInfiniteCountup = computed(() => props.invert && totalDuration.value === Infinity)

  function formatTime(time: number = 0): number {
    return props.millisecond ? Math.round(time) : Math.round(time * 1000)
  }

  // Get the current elapsed time.
  function getCurrent(now: DOMHighResTimeStamp): number {
    const rawCurrent = props.invert
      ? now - startTimestamp
      : totalDuration.value + startTimestamp - now

    // Convert milliseconds to seconds, round up, then back to milliseconds.
    if (props.intuitive && !props.invert && rawCurrent > 0) {
      const seconds = Math.ceil(rawCurrent / 1000)
      return Math.max(0, seconds * 1000)
    }

    return rawCurrent
  }

  function setCurrent(): void {
    const startAtValue = formatTime(props.startAt)

    if (props.invert) {
      // Count-up mode: start counting from startAt.
      timeRef.value = isInfiniteCountup.value
        ? startAtValue
        : Math.min(startAtValue, totalDuration.value)
    } else {
      // Count-down mode: start from totalDuration - startAt.
      const rawTime = Math.max(0, totalDuration.value - startAtValue)

      // Round the initial value up as well when intuitive is set.
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
      caf(rafId)
      rafId = raf(frame)
      return
    }

    previousFrameTime = now

    if (shouldFinish(current)) {
      finish()
      return
    }

    if (props.invert) {
      timeRef.value = isInfiniteCountup.value ? current : Math.min(current, totalDuration.value)
    } else {
      timeRef.value = Math.max(0, current)
    }

    caf(rafId)
    rafId = raf(frame)
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
    caf(rafId)
    rafId = 0
    unwatchTimes()
    unwatchActive()
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    stop,
    reset,
    timestamp: timeRef,
  }
}
