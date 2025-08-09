import type { MaybeRef } from 'vue'
import type { Callback } from '../types/shared/utils'
import { onBeforeUnmount, unref } from 'vue'
import { off, on } from '../utils/events'

interface RepeatActionReturnType {
  start: Callback
  stop: Callback
}

interface UseRepeatActionOptions {
  action: Callback
  disabled?: MaybeRef<boolean>
  finalInterval?: number
  initialInterval?: number
  accelerationDuration?: number
}

export function useRepeatAction(action: Callback): RepeatActionReturnType
export function useRepeatAction(options: UseRepeatActionOptions): RepeatActionReturnType
export function useRepeatAction(actionOrOptions: UseRepeatActionOptions | Callback): RepeatActionReturnType {
  const {
    action,
    disabled,
    finalInterval = 1000 / 10,
    initialInterval = 800,
    accelerationDuration = 2000,
  } = typeof actionOrOptions === 'function' ? { action: actionOrOptions } : actionOrOptions

  let timer: ReturnType<typeof setTimeout> | null = null
  let startTime = 0

  const step = () => {
    action()

    const elapsedTime = Date.now() - startTime
    let nextInterval: number

    if (elapsedTime >= accelerationDuration) {
      nextInterval = finalInterval
    } else {
      const progress = elapsedTime / accelerationDuration
      nextInterval = initialInterval - (initialInterval - finalInterval) * progress
    }

    timer = setTimeout(step, nextInterval)
  }

  const stop = () => {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  const start = () => {
    if (timer || unref(disabled)) {
      return
    }

    startTime = Date.now()
    action()

    timer = setTimeout(step, initialInterval)

    on(document, 'pointerup', stop, { once: true })
    on(document, 'pointercancel', stop, { once: true })
  }

  onBeforeUnmount(() => {
    off(document, 'pointerup', stop, { once: true })
    off(document, 'pointercancel', stop, { once: true })
  })

  return {
    start,
    stop,
  }
}
