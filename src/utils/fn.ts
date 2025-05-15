export const THROTTLE_GAP = 1000 / 90

export function debounce(fn: (...args: any[]) => void, delay: number) {
  let timer: number | null = null

  return function (this: any, ...args: any[]) {
    if (timer) {
      clearTimeout(timer)
    }

    timer = window.setTimeout(() => {
      fn.apply(this, args)
      timer = null
    }, delay)
  }
}

export function throttle(fn: (...args: any[]) => void, delay: number) {
  let timer: number | null = null
  let lastTime = 0

  return function (this: any, ...args: any[]) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    } else if (!timer) {
      timer = window.setTimeout(() => {
        fn.apply(this, args)
        lastTime = Date.now()
        timer = null
      }, delay)
    }
  }
}
