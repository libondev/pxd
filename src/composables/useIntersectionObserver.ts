// https://github.com/vueuse/vueuse/blob/main/packages/core/useIntersectionObserver/index.ts

import type { MaybeRef } from 'vue'
import { computed, onBeforeUnmount, toValue, watch } from 'vue'
import { notNullish } from '../utils/filter'
import { toArray } from '../utils/format'
import { unrefElement } from '../utils/unref'

interface UseIntersectionObserverReturnType {
  observer: IntersectionObserver | undefined
  stop: () => void
}

export function useIntersectionObserver(
  target: MaybeRef<HTMLElement | null | undefined> | MaybeRef<HTMLElement | null | undefined>[],
  callback: (entries: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit,
): UseIntersectionObserverReturnType {
  let observer: UseIntersectionObserverReturnType['observer']

  const targets = computed(() => toArray(toValue(target)).map(unrefElement).filter(notNullish))

  const cleanup = () => {
    if (!observer) {
      return
    }

    observer.disconnect()
    observer = undefined
  }

  const unwatch = watch(
    () => [targets.value],
    ([newTargets]) => {
      if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
        return
      }

      cleanup()

      observer = new IntersectionObserver((entries) => {
        entries.forEach(callback)
      }, options)

      newTargets.forEach(el => observer!.observe(el))
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
