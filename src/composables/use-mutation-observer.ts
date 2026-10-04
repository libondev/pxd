import type { ObserverResults, ObserverSpec, TargetRef } from '../utils/observer.js'
import type { MaybeRefOrGetter } from 'vue'
import { isServer } from '../utils/is.js'
import { createObserver } from '../utils/observer.js'

function normalize(options?: MutationObserverInit) {
  if (!options) {
    return ''
  }

  // Order carries no meaning, so sort before comparing.
  const filter = options.attributeFilter ? [...options.attributeFilter].sort().join(',') : ''

  return [
    options.attributes ?? false,
    filter,
    options.attributeOldValue ?? false,
    options.characterData ?? false,
    options.characterDataOldValue ?? false,
    options.childList ?? false,
    options.subtree ?? false,
  ].join('|')
}

const spec: ObserverSpec<MutationObserver, MutationObserverInit, MutationRecord> = {
  normalize,
  create(callback) {
    if (isServer() || typeof globalThis.MutationObserver === 'undefined') {
      return undefined
    }

    return new globalThis.MutationObserver(callback)
  },
  // `MutationObserver` has no `unobserve` in the DOM spec, so a removal has to replay the
  // whole set. Growing it still only observes the newcomers.
  sync(observer, prev, next, options) {
    if (prev.some((el) => !next.includes(el))) {
      observer.disconnect()
      next.forEach((el) => observer.observe(el, options))

      return
    }

    next.filter((el) => !prev.includes(el)).forEach((el) => observer.observe(el, options))
  },
  // A `subtree` observer reports descendants, so the owning element has to be looked up.
  resolveTarget(record, observed) {
    return observed.find((el) => el === record.target || el.contains(record.target))
  },
}

const observerWrapper = createObserver(spec)

export const useMutationObserver = (
  target: TargetRef,
  callback: (items: Array<{ entry: MutationRecord; target: HTMLElement }>) => void,
  options?: MaybeRefOrGetter<MutationObserverInit>,
): ObserverResults<MutationObserver> => observerWrapper(target, callback, options)
