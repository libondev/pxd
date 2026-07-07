import type { Nullable } from '../types/shared/utils'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { computed, onScopeDispose, watch, shallowRef } from 'vue'
import { getElement } from '../utils/dom'
import { toArray } from '../utils/format'
import { toValue } from '../utils/helper'
import { isNotNil } from '../utils/is'

export const useIntersectionObserver = createObserver(
  globalThis.IntersectionObserver,
  'IntersectionObserver',
)

export const useMutationObserver = createObserver(globalThis.MutationObserver, 'MutationObserver')

export const useResizeObserver = createObserver(globalThis.ResizeObserver, 'ResizeObserver')

type Observers = IntersectionObserver | ResizeObserver | MutationObserver
type Constructor = typeof IntersectionObserver | typeof ResizeObserver | typeof MutationObserver
type TargetRef =
  | MaybeRefOrGetter<Nullable<HTMLElement>>
  | MaybeRefOrGetter<Nullable<HTMLElement>>[]
  | MaybeRefOrGetter<Nullable<HTMLElement>[]>

interface ObserverResults<T extends Observers> {
  observer: Ref<T | undefined>
  stop: () => void
}

function createObserver(
  ObserverConstructor: typeof IntersectionObserver,
  type: 'IntersectionObserver',
): (
  target: TargetRef,
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit,
) => ObserverResults<IntersectionObserver>
function createObserver(
  ObserverConstructor: typeof MutationObserver,
  type: 'MutationObserver',
): (
  target: TargetRef,
  callback: MutationCallback,
  options?: MutationObserverInit,
) => ObserverResults<MutationObserver>
function createObserver(
  ObserverConstructor: typeof ResizeObserver,
  type: 'ResizeObserver',
): (
  target: TargetRef,
  callback: ResizeObserverCallback,
  options?: ResizeObserverOptions,
) => ObserverResults<ResizeObserver>
function createObserver(
  ObserverConstructor: Constructor,
  type: 'IntersectionObserver' | 'MutationObserver' | 'ResizeObserver',
) {
  function observerWrapper(
    target: TargetRef,
    callback: IntersectionObserverCallback | ResizeObserverCallback | MutationCallback,
    options?: IntersectionObserverInit | ResizeObserverOptions | MutationObserverInit,
  ) {
    const observer = shallowRef<Observers | undefined>()

    const targets = computed<HTMLElement[]>(() =>
      toArray(toValue(target)).map(getElement).filter(isNotNil),
    )

    const unwatch = watch(
      targets,
      (newTargets) => {
        if (typeof window === 'undefined' || typeof ObserverConstructor === 'undefined') {
          return
        }

        cleanup()

        if (!newTargets?.length) {
          return
        }

        if (type === 'IntersectionObserver') {
          observer.value = new (ObserverConstructor as typeof IntersectionObserver)(
            callback as IntersectionObserverCallback,
            options as IntersectionObserverInit,
          )
          newTargets.forEach((el) => observer.value!.observe(el))
        } else if (type === 'MutationObserver') {
          observer.value = new (ObserverConstructor as typeof MutationObserver)(
            callback as MutationCallback,
          )
          newTargets.forEach((el) =>
            (observer.value as MutationObserver).observe(el, options as MutationObserverInit),
          )
        } else if (type === 'ResizeObserver') {
          observer.value = new (ObserverConstructor as typeof ResizeObserver)(
            callback as ResizeObserverCallback,
          )
          newTargets.forEach((el) =>
            (observer.value as ResizeObserver).observe(el, options as ResizeObserverOptions),
          )
        }
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

    function cleanup() {
      if (!observer.value) {
        return
      }

      observer.value.disconnect()
      observer.value = undefined
    }

    function stop() {
      cleanup()
      unwatch()
    }

    onScopeDispose(() => {
      stop()
    })

    return {
      observer,
      stop,
    }
  }

  return observerWrapper as any
}
