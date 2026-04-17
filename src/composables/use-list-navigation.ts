import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { nextTick, shallowRef } from 'vue'
import { toValue, unrefElement } from '../utils/ref'

export interface UseListNavigationOptions {
  loop?: MaybeRefOrGetter<boolean>
  itemSelector?: MaybeRefOrGetter<string>
  defaultActiveIndex?: MaybeRefOrGetter<number>
  toggleOnKeyPress?: MaybeRefOrGetter<boolean>
  onToggle?: (index: number) => void
  onEnter?: (el: HTMLElement) => void
}

export interface UseListNavigationReturn {
  activeIndex: ShallowRef<number>
  setActiveIndex: (index: number) => void
  registerItem: (el: HTMLElement, indexRef: ShallowRef<number>) => void
  unregisterItem: (el: HTMLElement) => void
  onKeydown: (ev: KeyboardEvent) => void
  onPointerOver: (ev: PointerEvent) => void
  /**
   * Request a re-query of the DOM items. Multiple calls made within the same
   * tick coalesce into a single refresh that runs after `nextTick`. `await`
   * the returned promise when the caller needs `items` to be up-to-date
   * before its next action (e.g. `setFirstAsActive` after a search change).
   */
  refreshItems: () => Promise<void>
  setFirstAsActive: () => void
  isEmpty: () => boolean
}

const DISABLED_KEYS = ['PageUp', 'PageDown']

const KEY_DIRECTION: Record<string, -1 | 1 | undefined> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
}

function findNextIndex(len: number, from: number, dir: 1 | -1, loop: boolean): number {
  if (len === 0) {
    return -1
  }

  const i = from + dir
  if (loop) {
    return ((i % len) + len) % len
  }
  if (i < 0 || i >= len) {
    return -1
  }
  return i
}

export function useListNavigation(
  containerRef: MaybeRefOrGetter<HTMLElement | undefined>,
  options: UseListNavigationOptions,
): UseListNavigationReturn {
  const getLoop = () => toValue(options.loop) ?? true
  const getToggleOnKeyPress = () => toValue(options.toggleOnKeyPress) ?? true
  const getDefaultActiveIndex = () => toValue(options.defaultActiveIndex) ?? -1
  const getItemSelector = () => toValue(options.itemSelector) ?? '[data-list-item]'

  const activeIndex = shallowRef(getDefaultActiveIndex())
  const itemIndexRefs = new WeakMap<HTMLElement, ShallowRef<number>>()

  let items: HTMLElement[] = []
  let lastPointerX = -1
  let lastPointerY = -1

  // Coalesce bursts of `refreshItems` calls (typically N `registerItem`
  // triggers during initial mount) into a single DOM query at the next tick.
  // While a refresh is pending, every call returns the same promise, so the
  // real work runs exactly once per batch regardless of how many items mount.
  let pendingRefresh: Promise<void> | null = null

  function runRefresh() {
    const container = unrefElement(containerRef)
    items = container ? Array.from(container.querySelectorAll<HTMLElement>(getItemSelector())) : []

    items.forEach((el, i) => {
      const ref = itemIndexRefs.get(el)
      if (ref) {
        ref.value = i
      }
    })

    // Clamp when items shrank (e.g. an item was unregistered or filtered out).
    if (activeIndex.value >= items.length) {
      activeIndex.value = items.length - 1
    }

    const fallback = getDefaultActiveIndex()

    if (activeIndex.value === -1 && fallback >= 0 && fallback < items.length) {
      activeIndex.value = fallback
    }
  }

  function refreshItems(): Promise<void> {
    if (pendingRefresh) {
      return pendingRefresh
    }

    pendingRefresh = nextTick().then(() => {
      pendingRefresh = null
      runRefresh()
    })

    return pendingRefresh
  }

  function setActiveIndex(index: number): void {
    activeIndex.value = index
  }

  function setFirstAsActive(): void {
    activeIndex.value = findNextIndex(items.length, -1, 1, false)
  }

  function isEmpty(): boolean {
    return items.length === 0
  }

  function registerItem(el: HTMLElement, indexRef: ShallowRef<number>): void {
    itemIndexRefs.set(el, indexRef)
    refreshItems()
  }

  function unregisterItem(el: HTMLElement): void {
    itemIndexRefs.delete(el)
    refreshItems()
  }

  function onPointerOver(ev: PointerEvent): void {
    if (ev.pageX === lastPointerX && ev.pageY === lastPointerY) {
      return
    }
    lastPointerX = ev.pageX
    lastPointerY = ev.pageY

    const listItem = (ev.target as HTMLElement).closest<HTMLElement>(getItemSelector())
    if (!listItem) {
      return
    }

    const index = itemIndexRefs.get(listItem)?.value ?? -1
    if (index !== -1) {
      activeIndex.value = index
    }
  }

  function onKeydown(ev: KeyboardEvent): void {
    if (!getToggleOnKeyPress() || isEmpty()) {
      return
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = ev

    if (DISABLED_KEYS.includes(key)) {
      ev.preventDefault()
      ev.stopPropagation()
      return
    }

    if (ctrlKey || metaKey || altKey || shiftKey) {
      return
    }

    const len = items.length
    const current = activeIndex.value

    if (key === 'Enter') {
      if (current < 0 || current >= len) {
        return
      }

      const el = items[current]
      if (!el) {
        return
      }

      ev.preventDefault()
      ev.stopPropagation()

      if (typeof options.onEnter === 'function') {
        options.onEnter(el)
      } else {
        el.click()
      }
      return
    }

    let next: number
    if (key === 'Home') {
      next = findNextIndex(len, -1, 1, false)
    } else if (key === 'End') {
      next = findNextIndex(len, len, -1, false)
    } else {
      const dir = KEY_DIRECTION[key]
      if (!dir) {
        return
      }

      next =
        current === -1
          ? findNextIndex(len, dir === 1 ? -1 : len, dir, false)
          : findNextIndex(len, current, dir, getLoop())
    }

    if (next === -1) {
      return
    }

    ev.preventDefault()
    ev.stopPropagation()

    if (next !== current) {
      options.onToggle?.(next)
      activeIndex.value = next
      items[next]?.scrollIntoView({ block: 'nearest' })
    }
  }

  return {
    activeIndex,
    setActiveIndex,
    registerItem,
    unregisterItem,
    onKeydown,
    onPointerOver,
    refreshItems,
    setFirstAsActive,
    isEmpty,
  }
}
