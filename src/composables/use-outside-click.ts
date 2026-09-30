import type { MaybeElementRef } from '../types/shared/utils'
import { onScopeDispose, watch } from 'vue'
import { cachedOff, cachedOn } from '../utils/event.js'
import { toValue } from '../utils/helper.js'

interface Options<E extends Event = PointerEvent> {
  allowList?: MaybeElementRef<HTMLElement>[]
  eventName?: string
  listenerOptions?: AddEventListenerOptions
  enabled?: (ev: E) => boolean
  onTrigger?: (ev: E) => void
}

export function useOutsideClick<E extends Event = PointerEvent>(
  container: MaybeElementRef<HTMLElement>,
  options: Options<E> = {},
) {
  function onClick(ev: Event) {
    const { enabled } = options

    if (typeof enabled === 'function' && !enabled(ev as E)) {
      return
    }

    const { onTrigger, allowList = [container] } = options

    const currentTarget = ev.target as HTMLElement

    const isInside = allowList.some((el) => toValue(el)?.contains(currentTarget))

    if (isInside) {
      return
    }

    onTrigger?.(ev as E)
  }

  const event = options.eventName ?? 'click'
  const listenerOptions = options.listenerOptions

  function bind() {
    cachedOn(document, event, onClick, listenerOptions)
  }

  function unbind() {
    cachedOff(document, event, onClick, listenerOptions)
  }

  const unwatch = watch(
    () => toValue(container),
    (dom) => {
      unbind()

      if (dom) {
        bind()
      }
    },
    { immediate: true, flush: 'post' },
  )

  function stop() {
    unwatch()
    unbind()
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    stop,
  }
}
