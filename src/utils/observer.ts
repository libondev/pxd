import type { Nullable } from '../types/shared/utils'
import type { MaybeRefOrGetter, Ref } from 'vue'
import { onScopeDispose, shallowRef, watch } from 'vue'
import { getElement } from './dom.js'
import { toArray } from './format.js'
import { toValue } from './helper.js'
import { isNotNil, isServer } from './is.js'

export type TargetRef =
  | MaybeRefOrGetter<Nullable<HTMLElement>>
  | MaybeRefOrGetter<Nullable<HTMLElement>>[]
  | MaybeRefOrGetter<Nullable<HTMLElement>[]>

/**
 * The only native method this factory calls itself. Target bookkeeping goes through
 * `ObserverSpec.sync`, because `MutationObserver` has no `unobserve`.
 */
export interface AnyObserver {
  disconnect(): void
}

/** Every native entry reports the node it was produced for. */
export interface AnyObserverEntry {
  target: Node
}

export interface ObservedItem<TItem> {
  /** The native entry. A `MutationRecord` for mutation observers. */
  entry: TItem
  /** The registered element this entry belongs to. */
  target: HTMLElement
}

export interface ObserverResults<TObserver> {
  observer: Ref<TObserver | undefined>
  stop: () => void
}

export interface ObserverSpec<
  TObserver extends AnyObserver,
  TOptions,
  TItem extends AnyObserverEntry,
> {
  /** Options reduced to a stable string, so an equal setup shares one observer. */
  normalize: (options: TOptions | undefined) => string
  create: (
    callback: (items: TItem[], observer: TObserver) => void,
    options: TOptions | undefined,
  ) => TObserver | undefined
  /**
   * Applies the move from `prev` to `next` on an existing observer. Pooled specs are
   * driven one element at a time (`[]` to `[el]` adds, `[el]` to `[]` removes).
   */
  sync: (
    observer: TObserver,
    prev: HTMLElement[],
    next: HTMLElement[],
    options: TOptions | undefined,
  ) => void
  /** Attributes a native item to the registered element it was reported for. */
  resolveTarget: (item: TItem, observed: readonly HTMLElement[]) => HTMLElement | undefined
  /**
   * Share one native instance across every caller using equal options. Only valid when
   * items carry their own target, which rules out mutation observers.
   */
  pooled?: boolean
}

interface Subscription<TItem> {
  callback: (items: ObservedItem<TItem>[]) => void
}

interface PoolEntry<TObserver, TOptions, TItem> {
  observer: TObserver
  options: TOptions | undefined
  /** Live subscribers, so the pool is dropped once the last one leaves. */
  count: number
  targets: Map<HTMLElement, Set<Subscription<TItem>>>
}

function resolveTargets(source: TargetRef): HTMLElement[] {
  return [
    ...new Set(
      toArray(toValue(source))
        .map((i) => getElement(i))
        .filter(isNotNil),
    ),
  ]
}

function isSameElements(a: HTMLElement[], b: HTMLElement[]) {
  return a.length === b.length && a.every((el, i) => el === b[i])
}

export function createObserver<
  TObserver extends AnyObserver,
  TOptions,
  TItem extends AnyObserverEntry,
>(spec: ObserverSpec<TObserver, TOptions, TItem>) {
  // One pool per observer kind, keyed by the normalised options.
  const pools = new Map<string, PoolEntry<TObserver, TOptions, TItem>>()

  return function observerWrapper(
    target: TargetRef,
    callback: (items: ObservedItem<TItem>[]) => void,
    options?: MaybeRefOrGetter<TOptions>,
  ): ObserverResults<TObserver> {
    const observer = shallowRef<TObserver>()
    const subscription: Subscription<TItem> = { callback }

    let pool: PoolEntry<TObserver, TOptions, TItem> | undefined
    let observed: HTMLElement[] = []
    let activeKey: string | undefined

    function attach(el: HTMLElement) {
      let subs = pool!.targets.get(el)

      if (!subs) {
        pool!.targets.set(el, (subs = new Set()))
        spec.sync(pool!.observer, [], [el], pool!.options)
      }

      subs.add(subscription)
    }

    function detach(el: HTMLElement) {
      const subs = pool!.targets.get(el)

      subs?.delete(subscription)

      if (subs && !subs.size) {
        pool!.targets.delete(el)
        spec.sync(pool!.observer, [el], [], pool!.options)
      }
    }

    function dispatch(items: TItem[]) {
      const batches = new Map<Subscription<TItem>, TItem[]>()

      for (const entry of items) {
        const subs = pool?.targets.get(entry.target as HTMLElement)

        if (!subs) {
          continue
        }

        for (const sub of subs) {
          const batch = batches.get(sub)

          if (batch) {
            batch.push(entry)
          } else {
            batches.set(sub, [entry])
          }
        }
      }

      for (const [sub, batch] of batches) {
        sub.callback(batch.map((entry) => ({ entry, target: entry.target as HTMLElement })))
      }
    }

    function acquire(key: string, value: TOptions | undefined) {
      let entry = pools.get(key)

      if (!entry) {
        const created = spec.create(dispatch, value)

        if (!created) {
          return undefined
        }

        entry = { observer: created, options: value, count: 0, targets: new Map() }
        pools.set(key, entry)
      }

      entry.count++

      return entry
    }

    function cleanup() {
      if (pool) {
        observed.forEach(detach)
        pool.count--

        if (pool.count <= 0) {
          pool.observer.disconnect()
          pools.delete(activeKey!)
        }
      }

      pool = undefined
      observer.value = undefined
      observed = []
    }

    function emitDirectly(items: TItem[]) {
      const payload = items
        .map((entry) => {
          const target = spec.resolveTarget(entry, observed)

          return target ? { entry, target } : undefined
        })
        .filter(isNotNil)

      if (payload.length) {
        subscription.callback(payload)
      }
    }

    const unwatch = watch(
      [() => resolveTargets(target), () => spec.normalize(toValue(options))],
      ([newTargets, optionKey]) => {
        if (isServer()) {
          return
        }

        let targetsChanged = !isSameElements(observed, newTargets)

        if (optionKey !== activeKey) {
          activeKey = optionKey
          cleanup()
          targetsChanged = true
        }

        if (!targetsChanged) {
          return
        }

        if (spec.pooled) {
          if (!newTargets.length) {
            observed.forEach(detach)
            observed = []

            return
          }

          if (!pool) {
            pool = acquire(optionKey, toValue(options))

            if (!pool) {
              return
            }

            observer.value = pool.observer
            observed = []
          }

          observed.forEach((el) => {
            if (!newTargets.includes(el)) {
              detach(el)
            }
          })
          newTargets.forEach((el) => {
            if (!observed.includes(el)) {
              attach(el)
            }
          })

          observed = newTargets

          return
        }

        if (!newTargets.length) {
          if (observer.value) {
            spec.sync(observer.value, observed, newTargets, toValue(options))
            observed = []
          }

          return
        }

        if (!observer.value) {
          observer.value = spec.create(emitDirectly, toValue(options))

          if (!observer.value) {
            return
          }

          observed = []
        }

        spec.sync(observer.value, observed, newTargets, toValue(options))
        observed = newTargets
      },
      {
        immediate: true,
        flush: 'post',
      },
    )

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
}
