import type { MaybeRef } from 'vue'
import { onBeforeUnmount, unref, watch } from 'vue'

interface UseMutationObserverReturnType {
  observer: MutationObserver | undefined
  stop: () => void
}

export function useMutationObserver(
  target: MaybeRef<HTMLElement | null | undefined>,
  callback: MutationCallback,
  options?: MaybeRef<MutationObserverInit>,
): UseMutationObserverReturnType {
  let observer: MutationObserver | undefined

  const cleanup = () => {
    if (observer) {
      observer.disconnect()
      observer = undefined
    }
  }

  const unwatch = watch(
    [() => unref(target), () => unref(options)],
    ([target, options]) => {
      cleanup()

      if (typeof window === 'undefined' || !target || !('MutationObserver' in window)) {
        return
      }

      observer = new MutationObserver(callback)
      observer.observe(target, options)
    },
    {
      immediate: true,
      flush: 'post',
      deep: true,
    },
  )

  const stop = () => {
    cleanup()
    unwatch()
  }

  onBeforeUnmount(stop)

  return {
    observer,
    stop,
  }
}
