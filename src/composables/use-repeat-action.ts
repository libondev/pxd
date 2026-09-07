import type { Callback } from '../types/shared/utils'
import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose } from 'vue'
import { off, once } from '../utils/event'
import { toValue } from '../utils/helper'

interface Options {
  action: Callback
  disabled?: MaybeRefOrGetter<boolean>
  finalInterval?: number
  initialInterval?: number
  accelerationDuration?: number
}

interface Results {
  start: Callback
  stop: Callback
}

export function useRepeatAction(action: Callback): Results
export function useRepeatAction(options: Options): Results
export function useRepeatAction(actionOrOptions: Options | Callback): Results {
  const {
    action,
    disabled,
    finalInterval = 30,
    initialInterval = 500,
    accelerationDuration = 1000,
  } = typeof actionOrOptions === 'function' ? { action: actionOrOptions } : actionOrOptions

  let running = false
  let timer: ReturnType<typeof setTimeout> | null = null
  let elapsedTime = 0
  let nextInterval = initialInterval

  function intervalAt(elapsed: number) {
    if (elapsed >= accelerationDuration) {
      return finalInterval
    }

    const progress = elapsed / accelerationDuration
    return initialInterval - (initialInterval - finalInterval) * progress
  }

  function step() {
    if (!running || toValue(disabled)) {
      stop()
      return
    }

    action()

    if (!running) {
      return
    }

    elapsedTime += nextInterval
    nextInterval = intervalAt(elapsedTime)
    timer = setTimeout(step, nextInterval)
  }

  function stop() {
    running = false

    if (timer) {
      clearTimeout(timer)
      timer = null
    }

    off(document, 'pointerup', stop)
    off(document, 'pointercancel', stop)
  }

  function start() {
    if (running || toValue(disabled)) {
      return
    }

    running = true
    elapsedTime = 0
    nextInterval = initialInterval
    action()

    timer = setTimeout(step, nextInterval)

    once(document, 'pointerup', stop)
    once(document, 'pointercancel', stop)
  }

  onScopeDispose(stop)

  return {
    start,
    stop,
  }
}
