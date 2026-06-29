import type { Callback, Nullable } from '../types/shared'
import { isOverflowScrollable } from './dom'
import { isServer } from './is'

export function NOOP() {}

type EventHandler<E extends Event = Event> = (event: E) => void

interface CachedEntry {
  scheduler: EventListener
  handlers: Set<EventHandler>
}

const eventCache = new WeakMap<EventTarget, Map<string, CachedEntry>>()

function getCacheKey(event: string, options?: AddEventListenerOptions): string {
  return `${event}__${options?.capture ? 'capture' : 'bubble'}`
}

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

  const cacheKey = getCacheKey(event, options)

  let elementCache = eventCache.get(el)
  if (!elementCache) {
    elementCache = new Map()
    eventCache.set(el, elementCache)
  }

  let entry = elementCache.get(cacheKey)

  if (entry) {
    entry.handlers.add(handler as EventHandler)

    return () => cachedOff(el, event, handler, options)
  }

  const handlers = new Set<EventHandler>([handler as EventHandler])

  // Scheduler reads from the shared handler set to avoid stale closures and
  // per-dispatch array allocations.
  const scheduler: EventListener = (ev) => {
    handlers.forEach((h) => h(ev))
  }

  entry = { scheduler, handlers }
  elementCache.set(cacheKey, entry)
  el.addEventListener(event, scheduler, options)

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

  const elementCache = eventCache.get(el)

  if (!elementCache) {
    return
  }

  const cacheKey = getCacheKey(event, options)
  const entry = elementCache.get(cacheKey)

  if (!entry) {
    return
  }

  if (!entry.handlers.delete(handler as EventHandler)) {
    return
  }

  if (entry.handlers.size === 0) {
    el.removeEventListener(event, entry.scheduler, options)
    elementCache.delete(cacheKey)

    if (elementCache.size === 0) {
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
