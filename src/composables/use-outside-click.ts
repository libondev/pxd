import type { MaybeElementRef } from '../types/shared/utils'
import { onScopeDispose, watch } from 'vue'
import { cachedOff, cachedOn } from '../utils/event'
import { toValue } from '../utils/helper'

interface Options<E extends Event = PointerEvent> {
  allowList?: MaybeElementRef<HTMLElement>[]
  eventName?: string
  listenerOptions?: AddEventListenerOptions
  isEnabled?: (ev: E) => boolean
  onTrigger?: (ev: E) => void
}

export function useOutsideClick<E extends Event = PointerEvent>(
  container: MaybeElementRef<HTMLElement>,
  options: Options<E> = {},
) {
  function onClick(ev: Event) {
    const { isEnabled } = options

    if (typeof isEnabled === 'function' && !isEnabled(ev as E)) {
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

  const unwatch = watch(
    () => toValue(container),
    (dom, _, onCleanup) => {
      const event = options.eventName ?? 'click'
      const listenerOptions = options.listenerOptions

      if (dom) {
        cachedOn(document, event, onClick, listenerOptions)
      }

      onCleanup(() => {
        cachedOff(document, event, onClick, listenerOptions)
      })
    },
    { immediate: true },
  )

  function stop() {
    const event = options.eventName ?? 'click'
    const listenerOptions = options.listenerOptions

    unwatch()
    cachedOff(document, event, onClick, listenerOptions)
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    stop,
  }
}
