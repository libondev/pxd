import type { MaybeRefOrGetter } from 'vue'
import type { Nullable } from '../types/shared/utils'
import { computed, onBeforeUnmount, watch } from 'vue'
import { toArray } from '../utils/format'
import { isNotNullish } from '../utils/is'
import { toValue, unrefElement } from '../utils/ref'

export const useIntersectionObserver = createObserver(
  globalThis.IntersectionObserver,
)

export const useMutationObserver = createObserver(
  globalThis.MutationObserver,
)

export const useResizeObserver = createObserver(
  globalThis.ResizeObserver,
)

type Observers = IntersectionObserver | ResizeObserver | MutationObserver
type Constructor = typeof IntersectionObserver | typeof ResizeObserver | typeof MutationObserver
type TargetRef = MaybeRefOrGetter<Nullable<HTMLElement>> | MaybeRefOrGetter<Nullable<HTMLElement>>[]

interface ObserverReturnType<T extends Observers> {
  observer: T | undefined
  stop: () => void
}

function createObserver(
  ObserverConstructor: typeof IntersectionObserver
): (
  target: TargetRef,
  callback: IntersectionObserverCallback,
  options?: MaybeRefOrGetter<IntersectionObserverInit>
) => ObserverReturnType<IntersectionObserver>
function createObserver(
  ObserverConstructor: typeof MutationObserver
): (
  target: TargetRef,
  callback: MutationCallback,
  options?: MaybeRefOrGetter<MutationObserverInit>
) => ObserverReturnType<MutationObserver>
function createObserver(
  ObserverConstructor: typeof ResizeObserver
): (
  target: TargetRef,
  callback: ResizeObserverCallback,
  options?: MaybeRefOrGetter<ResizeObserverOptions>
) => ObserverReturnType<ResizeObserver>
function createObserver(ObserverConstructor: Constructor) {
  function observerWrapper(
    target: TargetRef,
    callback: IntersectionObserverCallback | ResizeObserverCallback | MutationCallback,
    options?: MaybeRefOrGetter<IntersectionObserverInit | ResizeObserverOptions | MutationObserverInit>,
  ) {
    let observer: Observers | undefined

    const targets = computed<HTMLElement[]>(() => toArray(toValue(target)).map(unrefElement).filter(isNotNullish))

    const unwatch = watch(
      () => [targets.value],
      ([newTargets]) => {
        if (typeof window === 'undefined' || typeof ObserverConstructor === 'undefined') {
          return
        }

        cleanup()

        if (ObserverConstructor.name === 'IntersectionObserver') {
          observer = new (ObserverConstructor as typeof IntersectionObserver)(
            callback as IntersectionObserverCallback,
            options as IntersectionObserverInit,
          )
          newTargets.forEach(el => observer!.observe(el))
        } else if (ObserverConstructor.name === 'MutationObserver') {
          observer = new (ObserverConstructor as typeof MutationObserver)(callback as MutationCallback)
          newTargets.forEach(el => (observer as MutationObserver).observe(el, options as MutationObserverInit))
        } else {
          observer = new (ObserverConstructor as typeof ResizeObserver)(callback as ResizeObserverCallback)
          newTargets.forEach(el => (observer as ResizeObserver).observe(el, options as ResizeObserverOptions))
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

    function cleanup() {
      if (!observer) {
        return
      }

      observer.disconnect()
      observer = undefined
    }

    function stop() {
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

  return observerWrapper as any
}
