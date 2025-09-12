import type { MaybeElementRef } from '../types/shared/utils'
import { onBeforeUnmount, watch } from 'vue'
import { optimizedOff, optimizedOn } from '../utils/event'
import { toValue } from '../utils/ref'

interface Options {
  isEnabled?: (ev: PointerEvent) => boolean
  isOutside?: (ev: PointerEvent) => boolean
  onTrigger?: (ev: PointerEvent) => void
}

export function useOutsideClick(
  container: MaybeElementRef<HTMLElement>,
  options: Options = {},
) {
  function onClick(ev: PointerEvent) {
    const { isEnabled, isOutside, onTrigger } = options

    if (typeof isEnabled === 'function' && !isEnabled(ev)) {
      return
    }

    if (typeof isOutside === 'function' && !isOutside(ev)) {
      return
    }

    if (toValue(container)?.contains(ev.target as HTMLElement)) {
      return
    }

    onTrigger?.(ev)
  }

  const unwatch = watch(() => toValue(container), (dom, _, onCleanup) => {
    if (dom) {
      optimizedOn(document, 'click', onClick)
    }

    onCleanup(() => {
      optimizedOff(document, 'click', onClick)
    })
  }, { immediate: true })

  function stop() {
    unwatch()
    optimizedOff(document, 'click', onClick)
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    stop,
  }
}
