import type { Nullable } from '../types/shared'
import { isOverflowScrollable } from './dom'

type EventHandler<E extends Event = Event> = (event: E) => void

export function on<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
) {
  if (!el) {
    return () => { }
  }

  el.addEventListener(
    event,
    handler as EventListener,
    options,
  )

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

  el.removeEventListener(
    event,
    handler as EventListener,
    options,
  )
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

  el.addEventListener(
    event,
    handler as EventListener,
    {
      ...options,
      once: true,
    },
  )
}

export function optimizedOn<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
) {
  if (!el) {
    return
  }

  const cacheKey = `__cached_${event}`
  const cachedEventHandlers = (el as any)[cacheKey] as EventHandler<E>[] | undefined

  // Fast path: already installed scheduler; dedupe same handler.
  if (cachedEventHandlers) {
    if (cachedEventHandlers.includes(handler)) {
      return
    }

    cachedEventHandlers.push(handler)
    return
  }

  // Scheduler always reads from cache to avoid stale closure references.
  const scheduler: EventHandler = (ev: Event) => {
    const list = (el as any)[cacheKey] as EventHandler<E>[] | undefined
    list?.slice(1).forEach(handler => handler(ev as E))
  }

  (el as any)[cacheKey] = [scheduler, handler]
  el.addEventListener(event, scheduler as EventListener, options)
}

export function optimizedOff<E extends Event = Event>(
  el: Nullable<EventTarget>,
  event: string,
  handler: EventHandler<E>,
  options?: AddEventListenerOptions,
) {
  if (!el) {
    return
  }

  const cachedEventHandlers = (el as any)[`__cached_${event}`] as EventHandler[]

  if (!cachedEventHandlers) {
    return
  }

  const index = cachedEventHandlers.indexOf(handler as EventHandler)

  if (index === -1) {
    return
  }

  cachedEventHandlers.splice(index, 1)

  if (cachedEventHandlers.length <= 1) {
    el.removeEventListener(event, cachedEventHandlers[0]!, options)
    delete (el as any)[`__cached_${event}`]
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
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
