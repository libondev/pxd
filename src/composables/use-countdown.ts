import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, onScopeDispose, shallowRef, toValue, watch } from 'vue'
import { caf, raf } from '../utils/event.js'

const UPDATE_INTERVAL = 100 // 100ms = 10fps

export interface CountdownOptions {
  /**
   * Whether to enable count up mode.
   * @default false
   */
  inverted?: MaybeRefOrGetter<boolean>
  /**
   * Whether the countdown is running.
   * @default false
   */
  enabled?: MaybeRefOrGetter<boolean>
  /**
   * The start time of the countdown.
   */
  startAt?: MaybeRefOrGetter<number>
  /**
   * The end time of the countdown.
   */
  endTime?: MaybeRefOrGetter<number>
  /**
   * Whether to automatically reset.
   * @default true
   */
  autoReset?: MaybeRefOrGetter<boolean>
  /**
   * The duration of the countdown.
   * @default 0
   */
  duration?: MaybeRefOrGetter<number>
  /**
   * Whether the time stamp is in milliseconds.
   * @default true
   */
  millisecond?: MaybeRefOrGetter<boolean>
  /**
   * Whether to enable human-friendly time display (ceil to seconds).
   * @default false
   */
  intuitive?: MaybeRefOrGetter<boolean>
  /**
   * Called when the countdown finishes.
   */
  onFinish?: () => void
  /**
   * Called when the countdown is reset.
   */
  onReset?: () => void
  /**
   * Called when the running state changes.
   */
  onChange?: (enabled: boolean) => void
}

interface Results {
  stop: () => void
  reset: () => void
  timestamp: Ref<number>
}

function read<T>(value: MaybeRefOrGetter<T | undefined>, fallback: T): T {
  return toValue(value) ?? fallback
}

export function useCountdown(options: CountdownOptions = {}): Results {
  let startTimestamp = -1
  let isFinished = false
  let isPaused = false
  let previousFrameTime = 0
  let rafId = 0

  const timeRef = shallowRef<number>(0)

  const isInverted = () => read(options.inverted, false)
  const isIntuitive = () => read(options.intuitive, false)

  const totalDuration = computed(() => {
    const endTime = toValue(options.endTime)

    if (endTime) {
      const end = formatTime(endTime) - Date.now()
      return Math.max(0, end)
    }

    // In count-up mode with no duration, count up indefinitely.
    if (isInverted() && [undefined, 0].includes(toValue(options.duration))) {
      return Infinity
    }

    return Math.max(0, formatTime(read(options.duration, 0)))
  })

  const isInfiniteCountup = computed(() => isInverted() && totalDuration.value === Infinity)

  function formatTime(time: number = 0): number {
    return read(options.millisecond, true) ? Math.round(time) : Math.round(time * 1000)
  }

  // Get the current elapsed time.
  function getCurrent(now: DOMHighResTimeStamp): number {
    const rawCurrent = isInverted()
      ? now - startTimestamp
      : totalDuration.value + startTimestamp - now

    // Convert milliseconds to seconds, round up, then back to milliseconds.
    if (isIntuitive() && !isInverted() && rawCurrent > 0) {
      const seconds = Math.ceil(rawCurrent / 1000)
      return Math.max(0, seconds * 1000)
    }

    return rawCurrent
  }

  function setCurrent(): void {
    const startAtValue = formatTime(toValue(options.startAt))

    if (isInverted()) {
      // Count-up mode: start counting from startAt.
      timeRef.value = isInfiniteCountup.value
        ? startAtValue
        : Math.min(startAtValue, totalDuration.value)
    } else {
      // Count-down mode: start from totalDuration - startAt.
      const rawTime = Math.max(0, totalDuration.value - startAtValue)

      // Round the initial value up as well when intuitive is set.
      if (isIntuitive() && rawTime > 0) {
        const seconds = Math.ceil(rawTime / 1000)
        timeRef.value = Math.max(0, seconds * 1000)
      } else {
        timeRef.value = rawTime
      }
    }
  }

  function shouldFinish(current: number): boolean {
    if (!isInverted()) {
      if (isIntuitive()) {
        const actualCurrent = totalDuration.value + startTimestamp - performance.now()
        return actualCurrent <= 0
      }

      return current <= 0
    }

    return !isInfiniteCountup.value && current >= totalDuration.value
  }

  function finish(): void {
    timeRef.value = isInverted() ? totalDuration.value : 0
    isFinished = true
    options.onFinish?.()
  }

  function reset(): void {
    startTimestamp = performance.now() - formatTime(toValue(options.startAt))
    isFinished = false
    isPaused = false
    setCurrent()
    options.onReset?.()

    if (read(options.enabled, false)) {
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

    if (isInverted()) {
      timeRef.value = isInfiniteCountup.value ? current : Math.min(current, totalDuration.value)
    } else {
      timeRef.value = Math.max(0, current)
    }

    caf(rafId)
    rafId = raf(frame)
  }

  const unwatchActive = watch(
    () => read(options.enabled, false),
    (isEnabled) => {
      options.onChange?.(isEnabled)

      if (isEnabled) {
        if (isPaused) {
          const elapsed = isInverted() ? timeRef.value : totalDuration.value - timeRef.value
          startTimestamp = performance.now() - elapsed
        } else {
          startTimestamp = performance.now() - formatTime(toValue(options.startAt))
        }

        isPaused = false

        if (isFinished && read(options.autoReset, true)) {
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
    () => [toValue(options.duration), toValue(options.endTime), toValue(options.startAt)],
    () => {
      setCurrent()
      isFinished = false
      if (read(options.enabled, false)) {
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
