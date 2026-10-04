import type { ObserverResults, ObserverSpec, TargetRef } from '../utils/observer.js'
import type { MaybeRefOrGetter } from 'vue'
import { isServer } from '../utils/is.js'
import { createObserver } from '../utils/observer.js'

const rootIds = new WeakMap<object, number>()
let rootFallbackId = 0

function getRootId(root?: Element | Document | null) {
  if (!root) {
    return 'null'
  }

  let id = rootIds.get(root)

  if (id === undefined) {
    rootIds.set(root, (id = rootFallbackId++))
  }

  return String(id)
}

function normalize(options?: IntersectionObserverInit) {
  if (!options) {
    return 'null|0px|0'
  }

  // Order carries no meaning, so sort before comparing.
  const threshold = Array.isArray(options.threshold)
    ? [...options.threshold].sort((a, b) => a - b).join(',')
    : String(options.threshold ?? 0)

  return `${getRootId(options.root)}|${options.rootMargin ?? '0px'}|${threshold}`
}

const spec: ObserverSpec<
  IntersectionObserver,
  IntersectionObserverInit,
  IntersectionObserverEntry
> = {
  normalize,
  create(callback, options) {
    if (isServer() || typeof globalThis.IntersectionObserver === 'undefined') {
      return undefined
    }

    return new globalThis.IntersectionObserver(callback, options)
  },
  sync(observer, prev, next) {
    prev.filter((el) => !next.includes(el)).forEach((el) => observer.unobserve(el))
    next.filter((el) => !prev.includes(el)).forEach((el) => observer.observe(el))
  },
  resolveTarget: (entry) => entry.target as HTMLElement,
  pooled: true,
}

const observerWrapper = createObserver(spec)

export const useIntersectionObserver = (
  target: TargetRef,
  callback: (items: Array<{ entry: IntersectionObserverEntry; target: HTMLElement }>) => void,
  options?: MaybeRefOrGetter<IntersectionObserverInit>,
): ObserverResults<IntersectionObserver> => observerWrapper(target, callback, options)
