import type { Callback } from '../types/shared'
import { caf, raf } from './raf'

export const THROTTLE_GAP = 1000 / 90

export function debounce<T extends Callback>(
  callback: T,
  delay: number,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: number | null = null
  let pendingPromise: { resolve: (value: ReturnType<T>) => void } | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve) => {
      if (timer) {
        clearTimeout(timer)
      }

      pendingPromise = { resolve }

      timer = window.setTimeout(() => {
        const result = callback.apply(this, args)
        pendingPromise?.resolve(result)
        timer = null
        pendingPromise = null
      }, delay)
    })
  }
}

export function throttle<T extends Callback>(
  callback: T,
  delay: number = THROTTLE_GAP,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timer: number | null = null
  let lastTime = 0
  let pendingPromise: { resolve: (value: ReturnType<T>) => void } | null = null

  return function (this: ThisParameterType<T>, ...args: Parameters<T>): Promise<ReturnType<T>> {
    return new Promise((resolve) => {
      const now = Date.now()
      pendingPromise = { resolve }

      if (now - lastTime >= delay) {
        const result = callback.apply(this, args)
        pendingPromise.resolve(result)
        pendingPromise = null
        lastTime = now
      } else if (!timer) {
        timer = window.setTimeout(() => {
          const result = callback.apply(this, args)
          pendingPromise?.resolve(result)
          lastTime = Date.now()
          timer = null
          pendingPromise = null
        }, delay)
      }
    })
  }
}

interface ThrottleByRafReturnType<T extends Callback> {
  (...args: Parameters<T>): void
  cancel: () => void
}

// https://github.com/arco-design/arco-design-vue/blob/main/packages/web-vue/components/_utils/throttle-by-raf.ts
export function throttleByRaf<T extends Callback>(
  callback: T,
): ThrottleByRafReturnType<T> {
  let timer = 0

  const throttle = (...args: any[]): void => {
    if (timer) {
      caf(timer)
    }
    timer = raf(() => {
      callback(...args)
      timer = 0
    })
  }

  throttle.cancel = () => {
    caf(timer)
    timer = 0
  }

  return throttle
}
