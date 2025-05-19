import type { MaybeRef } from 'vue'
import { onBeforeUnmount, unref, watch } from 'vue'

interface UseResizeObserverReturnType {
  observer: ResizeObserver | undefined
  stop: () => void
}

export function useResizeObserver(
  target: MaybeRef<HTMLElement | null | undefined>,
  callback: (entries: ResizeObserverEntry) => void,
): UseResizeObserverReturnType {
  let observer: ResizeObserver | undefined

  const cleanup = () => {
    if (!observer) {
      return
    }

    observer.disconnect()
    observer = undefined
  }

  const unwatch = watch(
    () => unref(target),
    (newVal, oldVal) => {
      if (typeof window === 'undefined' || typeof ResizeObserver === 'undefined') {
        return
      }

      cleanup()

      observer = new ResizeObserver((entries) => {
        entries.forEach(callback)
      })

      if (oldVal) {
        observer.unobserve(oldVal)
      }

      if (newVal) {
        observer.observe(newVal)
      }
    },
    {
      immediate: true,
      flush: 'post',
    },
  )

  const stop = () => {
    cleanup()
    unwatch()
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    observer,
    stop,
  }
}
