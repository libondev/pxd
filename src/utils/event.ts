import type { Nullable } from '../types/shared'

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
      ...(options || {}),
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

  let cachedEventHandlers = (el as any)[`__cached_${event}`] as EventListener[]

  if (cachedEventHandlers) {
    cachedEventHandlers.push(handler as EventListener)
    return
  }

  const scheduler: EventListener = (ev: Event) => {
    cachedEventHandlers.slice(1).forEach(handler => handler(ev))
  }

  cachedEventHandlers = [scheduler, handler as EventListener];
  (el as any)[`__cached_${event}`] = cachedEventHandlers

  el.addEventListener(event, scheduler, options)
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

  const cachedEventHandlers = (el as any)[`__cached_${event}`] as EventListener[]

  if (!cachedEventHandlers) {
    return
  }

  const index = cachedEventHandlers.indexOf(handler as EventListener)

  if (index === -1) {
    return
  }

  cachedEventHandlers.splice(index, 1)

  if (cachedEventHandlers.length <= 1) {
    el.removeEventListener(event, cachedEventHandlers[0], options)
    delete (el as any)[`__cached_${event}`]
  }
}

export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function preventDefaultFn(ev: Event) {
  ev.preventDefault()
}
