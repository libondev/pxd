import type { Callback } from '../types/shared'

// export { throttle as throttleCompat } from 'es-toolkit/compat'
export { throttle } from 'es-toolkit/function'

interface ThrottleByRafReturnType<T extends Callback> {
  (...args: Parameters<T>): void
  cancel: () => void
}

// https://github.com/arco-design/arco-design-vue/blob/main/packages/web-vue/components/_utils/throttle-by-raf.ts
export function throttleByRaf<T extends Callback>(callback: T): ThrottleByRafReturnType<T> {
  let timer: number

  const throttle = (...args: Parameters<T>): void => {
    if (timer) {
      window.cancelAnimationFrame(timer)
    }

    timer = window.requestAnimationFrame(() => {
      callback(...args)
      timer = -1
    })
  }

  throttle.cancel = () => {
    window.cancelAnimationFrame(timer)
    timer = 0
  }

  return throttle
}
