import type { Callback } from '../types/shared'
import { caf, raf } from './raf'

export { default as debounce } from 'lodash.debounce'
export { default as throttle } from 'lodash.throttle'

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
