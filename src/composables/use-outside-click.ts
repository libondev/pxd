import type { MaybeElementRef } from '../types/shared/utils'
import type { MaybeRefOrGetter } from 'vue'
import { onScopeDispose, watch } from 'vue'
import { cachedOff, cachedOn } from '../utils/event.js'
import { toValue } from '../utils/helper.js'
import { isServer } from '../utils/is.js'

interface Options<E extends Event = PointerEvent> {
  allowList?: MaybeElementRef<HTMLElement>[]
  eventName?: string
  listenerOptions?: AddEventListenerOptions
  enabled?: MaybeRefOrGetter<boolean>
  onTrigger?: (ev: E) => void
}

export function useOutsideClick<E extends Event = PointerEvent>(
  container: MaybeElementRef<HTMLElement>,
  options: Options<E> = {},
) {
  function onClick(ev: Event) {
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

  const target = isServer() ? null : document

  function bind() {
    cachedOn(target, event, onClick, listenerOptions)
  }

  function unbind() {
    cachedOff(target, event, onClick, listenerOptions)
  }

  const unwatch = watch(
    () => Boolean(toValue(container)) && toValue(options.enabled ?? true),
    (active) => {
      unbind()

      if (active) {
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
