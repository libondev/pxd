import type { Nullable } from '../types/shared'
import { hasScrollbar, isScrollable } from './dom'

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

  let cachedEventHandlers = (el as any)[`__cached_${event}`] as EventHandler<E>[]

  if (cachedEventHandlers && !cachedEventHandlers.includes(handler)) {
    cachedEventHandlers.push(handler)
    return
  }

  const scheduler: EventHandler = (ev: Event) => {
    cachedEventHandlers.slice(1).forEach(handler => handler(ev as E))
  }

  cachedEventHandlers = [scheduler, handler];
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

function checkOverflowScroll(ele: Element): boolean {
  const { x: xScrollbar, y: yScrollbar } = hasScrollbar(ele as HTMLElement)
  const { x: xScrollable, y: yScrollable } = isScrollable(ele as HTMLElement)

  if ((xScrollbar && xScrollable) || (yScrollbar && yScrollable)) {
    return true
  }

  const parent = ele.parentNode

  if (!(parent instanceof Element) || parent.tagName === 'BODY') {
    return false
  }

  return checkOverflowScroll(parent)
}

export function preventDefaultScroll(ev: Event): boolean {
  const _target = ev.target

  // Do not prevent if element or parentNodes have overflow: scroll set.
  if (_target instanceof Element && checkOverflowScroll(_target)) {
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
