type EventHandler<E extends Event = Event> = (event: E) => void

export function on<E extends Event = Event>(
  el: EventTarget,
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
  el: EventTarget,
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
  el: EventTarget,
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
