import type { MaybeElementRef } from '../types/shared/utils'
import { onScopeDispose, watch } from 'vue'
import { cachedOff, cachedOn } from '../utils/event'
import { toValue } from '../utils/ref'

interface Options {
  allowList?: MaybeElementRef<HTMLElement>[]
  isEnabled?: (ev: PointerEvent) => boolean
  onTrigger?: (ev: PointerEvent) => void
}

export function useOutsideClick(container: MaybeElementRef<HTMLElement>, options: Options = {}) {
  function onClick(ev: PointerEvent) {
    const { isEnabled } = options

    if (typeof isEnabled === 'function' && !isEnabled(ev)) {
      return
    }

    const { onTrigger, allowList = [container] } = options

    const currentTarget = ev.target as HTMLElement

    const isInside = allowList.some((el) => toValue(el)?.contains(currentTarget))

    if (isInside) {
      return
    }

    onTrigger?.(ev)
  }

  const unwatch = watch(
    () => toValue(container),
    (dom, _, onCleanup) => {
      if (dom) {
        cachedOn(document, 'click', onClick)
      }

      onCleanup(() => {
        cachedOff(document, 'click', onClick)
      })
    },
    { immediate: true },
  )

  function stop() {
    unwatch()
    cachedOff(document, 'click', onClick)
  }

  onScopeDispose(() => {
    stop()
  })

  return {
    stop,
  }
}
