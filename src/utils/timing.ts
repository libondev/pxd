export interface DebounceOptions {
  signal?: AbortSignal
  edges?: Array<'leading' | 'trailing'>
}

export interface DebouncedFunction<F extends (...args: any[]) => void> {
  (...args: Parameters<F>): void
  schedule: () => void
  cancel: () => void
  flush: () => void
}

export interface ThrottleOptions {
  signal?: AbortSignal
  edges?: Array<'leading' | 'trailing'>
}

export interface ThrottledFunction<F extends (...args: any[]) => void> {
  (...args: Parameters<F>): void
  cancel: () => void
  flush: () => void
}

export function debounce<F extends (...args: any[]) => void>(
  func: F,
  debounceMs: number,
  { signal, edges }: DebounceOptions = {},
): DebouncedFunction<F> {
  let pendingInvoke: (() => void) | null = null
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const leading = edges?.includes('leading') ?? false
  const trailing = edges?.includes('trailing') ?? true

  const invoke = () => {
    if (!pendingInvoke) {
      return
    }

    pendingInvoke()
    pendingInvoke = null
  }

  const cancelTimer = () => {
    if (timeoutId === null) {
      return
    }

    clearTimeout(timeoutId)
    timeoutId = null
  }

  const cancel = () => {
    cancelTimer()
    pendingInvoke = null
  }

  const schedule = () => {
    cancelTimer()
    timeoutId = setTimeout(() => {
      timeoutId = null

      if (trailing) {
        invoke()
      }

      cancel()
    }, debounceMs)
  }

  const debounced = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (signal?.aborted) {
      return
    }

    pendingInvoke = () => func.apply(this, args)

    const isFirstCall = !timeoutId
    schedule()

    if (leading && isFirstCall) {
      invoke()
    }
  } as DebouncedFunction<F>

  debounced.schedule = schedule
  debounced.cancel = cancel
  debounced.flush = invoke

  signal?.addEventListener('abort', cancel, { once: true })

  return debounced
}

export function throttle<F extends (...args: any[]) => void>(
  func: F,
  throttleMs: number,
  { signal, edges = ['leading', 'trailing'] }: ThrottleOptions = {},
): ThrottledFunction<F> {
  let pendingAt: number | null = null

  const debounced = debounce(
    function (this: ThisParameterType<F>, ...args: Parameters<F>) {
      pendingAt = Date.now()
      func.apply(this, args)
    },
    throttleMs,
    { signal, edges },
  )

  const throttled = function (this: ThisParameterType<F>, ...args: Parameters<F>) {
    if (signal?.aborted) {
      return
    }

    if (pendingAt === null) {
      pendingAt = Date.now()
    }

    if (Date.now() - pendingAt >= throttleMs) {
      pendingAt = Date.now()
      func.apply(this, args)
      debounced.cancel()
      debounced.schedule()
      return
    }

    debounced.apply(this, args)
  } as ThrottledFunction<F>

  throttled.cancel = debounced.cancel
  throttled.flush = debounced.flush

  return throttled
}
