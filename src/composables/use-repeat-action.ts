import type { MaybeRefOrGetter } from 'vue'

import { onBeforeUnmount } from 'vue'

import type { Callback } from '../types/shared/utils'

import { off, once } from '../utils/event'
import { toValue } from '../utils/ref'

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
    finalInterval = 1000 / 16.6, // 60fps
    initialInterval = 680,
    accelerationDuration = 1500,
  } = typeof actionOrOptions === 'function' ? { action: actionOrOptions } : actionOrOptions

  let timer: ReturnType<typeof setTimeout> | null = null
  let startTime = 0

  function step() {
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

  function stop() {
    if (timer) {
      clearTimeout(timer)
      timer = null
    }
  }

  function start() {
    if (timer || toValue(disabled)) {
      return
    }

    startTime = Date.now()
    action()

    timer = setTimeout(step, initialInterval)

    once(document, 'pointerup', stop)
    once(document, 'pointercancel', stop)
  }

  onBeforeUnmount(() => {
    off(document, 'pointerup', stop)
    off(document, 'pointercancel', stop)
  })

  return {
    start,
    stop,
  }
}
