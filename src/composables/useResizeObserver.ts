import type { MaybeRef } from 'vue'
import { onBeforeUnmount, unref, watch } from 'vue'

export function useResizeObserver(
  target: MaybeRef<HTMLElement | null>,
  callback: (entries: ResizeObserverEntry) => void,
) {
  const resizeObserver = new ResizeObserver((entries) => {
    entries.forEach(callback)
  })

  const stop = () => {
    resizeObserver.disconnect()
  }

  watch(
    () => unref(target),
    (newVal, oldVal) => {
      if (oldVal) {
        resizeObserver.unobserve(oldVal)
      }
      else {
        stop()
      }

      if (newVal) {
        resizeObserver.observe(newVal)
      }
    },
    {
      immediate: true,
    },
  )

  onBeforeUnmount(() => {
    stop()
  })

  return {
    observer: resizeObserver,
    stop,
  }
}
