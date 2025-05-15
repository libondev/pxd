import type { MaybeRef } from 'vue'
import { onBeforeUnmount, unref, watch } from 'vue'

export function useIntersectionObserver(
  target: MaybeRef<HTMLElement | null>,
  callback: (entries: IntersectionObserverEntry) => void,
) {
  let observer: IntersectionObserver | undefined

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
      if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
        return
      }

      cleanup()

      observer = new IntersectionObserver((entries) => {
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
    unwatch()
    cleanup()
  }

  onBeforeUnmount(() => {
    stop()
  })

  return {
    observer,
    stop,
  }
}
