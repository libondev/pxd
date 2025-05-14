export function throttle(fn: (...args: any[]) => void, delay: number) {
  let timer: number | null = null
  let lastTime = 0

  return function (this: any, ...args: any[]) {
    const now = Date.now()
    if (now - lastTime >= delay) {
      fn.apply(this, args)
      lastTime = now
    }
    else if (!timer) {
      timer = window.setTimeout(() => {
        fn.apply(this, args)
        lastTime = Date.now()
        timer = null
      }, delay)
    }
  }
}
