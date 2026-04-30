import type { Callback } from '../types/shared'

export { debounce } from 'es-toolkit/function'
export { throttle } from 'es-toolkit/function'
// export { throttle as throttleCompat } from 'es-toolkit/compat'
// export { debounce as debounceCompat } from 'es-toolkit/compat'

interface ThrottleByRafReturnType<T extends Callback> {
  (...args: Parameters<T>): void
  cancel: () => void
}

export function throttleByRaf<T extends Callback>(callback: T): ThrottleByRafReturnType<T> {
  let animationFrameId: number = 0

  const throttle = (...args: Parameters<T>): void => {
    if (animationFrameId) {
      return
    }

    animationFrameId = window.requestAnimationFrame(() => {
      animationFrameId = 0
      callback(...args)
    })
  }

  throttle.cancel = () => {
    if (animationFrameId) {
      window.cancelAnimationFrame(animationFrameId)
      animationFrameId = 0
    }
  }

  return throttle
}
