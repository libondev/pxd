import type { ObserverResults, ObserverSpec, TargetRef } from '../utils/observer.js'
import type { MaybeRefOrGetter } from 'vue'
import { isServer } from '../utils/is.js'
import { createObserver } from '../utils/observer.js'

function normalize(options?: ResizeObserverOptions) {
  return options?.box ?? ''
}

const spec: ObserverSpec<ResizeObserver, ResizeObserverOptions, ResizeObserverEntry> = {
  normalize,
  create(callback) {
    if (isServer() || typeof globalThis.ResizeObserver === 'undefined') {
      return undefined
    }

    return new globalThis.ResizeObserver(callback)
  },
  sync(observer, prev, next, options) {
    prev.filter((el) => !next.includes(el)).forEach((el) => observer.unobserve(el))
    next.filter((el) => !prev.includes(el)).forEach((el) => observer.observe(el, options))
  },
  resolveTarget: (entry) => entry.target as HTMLElement,
  pooled: true,
}

const observerWrapper = createObserver(spec)

export const useResizeObserver = (
  target: TargetRef,
  callback: (items: Array<{ entry: ResizeObserverEntry; target: HTMLElement }>) => void,
  options?: MaybeRefOrGetter<ResizeObserverOptions>,
): ObserverResults<ResizeObserver> => observerWrapper(target, callback, options)
