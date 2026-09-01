import type { ShallowRef } from 'vue'
import { shallowRef } from 'vue'

export interface OrderedChild<T> {
  key: string
  el: HTMLElement | null
  payload: T
}

const DOCUMENT_POSITION_FOLLOWING = 4

function byDocumentOrder<T>(a: OrderedChild<T>, b: OrderedChild<T>) {
  if (!a.el || !b.el || a.el === b.el) {
    return 0
  }

  return a.el.compareDocumentPosition(b.el) & DOCUMENT_POSITION_FOLLOWING ? -1 : 1
}

/**
 * Self-registering children keyed in a Map (registration order is not the
 * source of truth). Once elements exist, items are sorted with
 * `compareDocumentPosition` so HMR remounts that reverse setup order still
 * match the DOM. Insertion order is kept as a fallback for SSR / first paint.
 */
export function useOrderedChildren<T>(): {
  items: ShallowRef<OrderedChild<T>[]>
  register: (key: string, payload: T, el?: HTMLElement | null) => void
  unregister: (key: string) => T | undefined
} {
  const items = shallowRef<OrderedChild<T>[]>([])
  const registry = new Map<string, OrderedChild<T>>()

  function publish() {
    const next = [...registry.values()]
    next.sort(byDocumentOrder)
    items.value = next
  }

  function register(key: string, payload: T, el?: HTMLElement | null) {
    const current = registry.get(key)

    if (current) {
      current.payload = payload

      if (el !== undefined) {
        current.el = el
      }
    } else {
      registry.set(key, { key, el: el ?? null, payload })
    }

    publish()
  }

  function unregister(key: string): T | undefined {
    const current = registry.get(key)

    if (!current) {
      return undefined
    }

    registry.delete(key)
    publish()

    return current.payload
  }

  return { items, register, unregister }
}
