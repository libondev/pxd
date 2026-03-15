import type { MaybeElementRef } from '../types/shared/utils'
import { onBeforeUnmount, watch } from 'vue'
import { cachedOff, cachedOn } from '../utils/event'
import { toValue } from '../utils/ref'

interface Options {
  isEnabled?: (ev: PointerEvent) => boolean
  isOutside?: (ev: PointerEvent) => boolean
  onTrigger?: (ev: PointerEvent) => void
}

export function useOutsideClick(container: MaybeElementRef<HTMLElement>, options: Options = {}) {
  function onClick(ev: PointerEvent) {
    const { isEnabled, isOutside, onTrigger } = options

    if (typeof isEnabled === 'function' && !isEnabled(ev)) {
      return
    }

    if (typeof isOutside === 'function') {
      if (!isOutside(ev)) {
        return
      }
    } else {
      if (!toValue(container)!.contains(ev.target as HTMLElement)) {
        return
      }
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

  onBeforeUnmount(() => {
    stop()
  })

  return {
    stop,
  }
}
