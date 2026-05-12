import type { Callback, Nullable } from '../types/shared'
import { isOverflowScrollable } from './dom'
import { isServer } from './is'

export function NOOP() {}

type EventHandler<E extends Event = Event> = (event: E) => void

const eventCache = new WeakMap<EventTarget, Record<string, EventHandler[]>>()

export function on<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
) {
  if (!el) {
    return () => {}
  }

  el.addEventListener(event, handler as EventListener, options)

  return () => {
    off(el, event, handler, options)
  }
}

export function off<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
) {
  if (!el) {
    return
  }

  el.removeEventListener(event, handler as EventListener, options)
}

export function once<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
) {
  if (!el) {
    return
  }

  el.addEventListener(event, handler as EventListener, {
    ...options,
    once: true,
  })
}

export function cachedOn<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
): () => void {
  if (!el) {
    return () => {}
  }

  const cacheKey = `__cached_${event}`

  let elementCache = eventCache.get(el)
  if (!elementCache) {
    elementCache = {}
    eventCache.set(el, elementCache)
  }

  const cachedEventHandlers = elementCache[cacheKey] as EventHandler<E>[] | undefined

  if (cachedEventHandlers) {
    if (!cachedEventHandlers.includes(handler)) {
      cachedEventHandlers.push(handler)
    }

    return () => cachedOff(el, event, handler, options)
  }

  // Scheduler always reads from cache to avoid stale closure references.
  const scheduler = (ev: Event) => {
    const list = elementCache?.[cacheKey] as EventHandler<E>[] | undefined
    list?.slice(1).forEach((h: EventHandler<E>) => h(ev as E))
  }

  const handlers: EventHandler<E>[] = [scheduler as EventHandler<E>, handler]
  elementCache[cacheKey] = handlers as EventHandler[]
  el.addEventListener(event, scheduler as EventListener, options)

  return () => cachedOff(el, event, handler, options)
}

export function cachedOff<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
): void {
  if (!el) {
    return
  }

  const cacheKey = `__cached_${event}`
  const elementCache = eventCache.get(el)

  if (!elementCache) {
    return
  }

  const cachedEventHandlers = elementCache[cacheKey] as EventHandler[] | undefined

  if (!cachedEventHandlers) {
    return
  }

  const index = cachedEventHandlers.indexOf(handler as EventHandler)

  if (index === -1) {
    return
  }

  cachedEventHandlers.splice(index, 1)

  if (cachedEventHandlers.length <= 1) {
    const scheduler = cachedEventHandlers[0]
    if (scheduler) {
      el.removeEventListener(event, scheduler as EventListener, options)
    }
    delete elementCache[cacheKey]

    if (Object.keys(elementCache).length === 0) {
      eventCache.delete(el)
    }
  }
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function preventDefaultScroll(ev: Event): boolean {
  const _target = ev.target

  // Do not prevent if element or parentNodes have overflow: scroll set.
  if (_target instanceof Element && isOverflowScrollable(_target)) {
    return false
  }

  // Do not prevent if the event has more than one touch (usually meaning this is a multi touch gesture like pinch to zoom).
  if ((ev as TouchEvent).touches?.length > 1) {
    return true
  }

  if (ev.preventDefault && ev.cancelable) {
    ev.preventDefault()
  }

  return false
}

export function raf(fn: FrameRequestCallback): number {
  return isServer() ? -1 : requestAnimationFrame(fn)
}

export function caf(id: number) {
  if (isServer()) {
    return
  }

  cancelAnimationFrame(id)
}

export function doubleRaf(fn: FrameRequestCallback): number {
  return raf(() => raf(fn))
}

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

    animationFrameId = raf(() => {
      animationFrameId = 0
      callback(...args)
    })
  }

  throttle.cancel = () => {
    if (animationFrameId) {
      caf(animationFrameId)
      animationFrameId = 0
    }
  }

  return throttle
}
