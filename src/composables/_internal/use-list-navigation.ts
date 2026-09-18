import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { nextTick, shallowRef } from 'vue'
import { getElement } from '../../utils/dom.js'
import { toValue } from '../../utils/helper.js'

export interface UseListNavigationOptions {
  loop?: MaybeRefOrGetter<boolean>
  itemSelector?: MaybeRefOrGetter<string>
  defaultActiveIndex?: MaybeRefOrGetter<number>
  itemFilter?: (el: HTMLElement, container: HTMLElement) => boolean
  onActivateItem?: (el: HTMLElement) => void
  onToggle?: (index: number) => void
  onLeft?: () => void
  onRight?: (el: HTMLElement) => void
  onActivate?: () => void
}

export type ListNavigationCommand =
  | 'first'
  | 'last'
  | 'next'
  | 'previous'
  | 'activate'
  | 'enter-child'
  | 'leave-parent'

export interface UseListNavigationReturn {
  activeIndex: ShallowRef<number>
  setActiveIndex: (index: number) => void
  registerItem: (el: HTMLElement, indexRef: ShallowRef<number>) => void
  unregisterItem: (el: HTMLElement) => void
  dispatch: (command: ListNavigationCommand) => boolean
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

  function setItemSelected(el: HTMLElement | undefined, selected: boolean) {
    const next = selected ? 'true' : 'false'

    if (el && el.getAttribute('aria-selected') !== next) {
      el.setAttribute('aria-selected', next)
    }
  }

  function syncHighlightAttributes() {
    const active = activeIndex.value

    for (let i = 0; i < items.length; i++) {
      setItemSelected(items[i], i === active)
    }
  }

  function applyActiveHighlight(from: number, to: number) {
    if (from === to) {
      return
    }

    if (from >= 0 && from < items.length) {
      setItemSelected(items[from], false)
    }

    if (to >= 0 && to < items.length) {
      setItemSelected(items[to], true)
    }
  }

  function runRefresh() {
    const container = getElement(containerRef)
    const itemFilter = options.itemFilter
    items = container
      ? Array.from(container.querySelectorAll<HTMLElement>(getItemSelector())).filter(
          (el) => !itemFilter || itemFilter(el, container),
        )
      : []

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

    syncHighlightAttributes()
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
    const prev = activeIndex.value

    if (prev === index) {
      if (index >= 0 && index < items.length) {
        setItemSelected(items[index], true)
      }
      return
    }

    applyActiveHighlight(prev, index)
    activeIndex.value = index
  }

  function setFirstAsActive(): void {
    setActiveIndex(findNextIndex(items.length, -1, 1, false))
  }

  function isEmpty(): boolean {
    return items.length === 0
  }

  function registerItem(el: HTMLElement, indexRef: ShallowRef<number>): void {
    itemIndexRefs.set(el, indexRef)
    void refreshItems()
  }

  function unregisterItem(el: HTMLElement): void {
    itemIndexRefs.delete(el)
    void refreshItems()
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
      options.onActivate?.()
      setActiveIndex(index)
    }
  }

  function getActiveItem(): HTMLElement | undefined {
    const index = activeIndex.value
    return index >= 0 && index < items.length ? items[index] : undefined
  }

  function dispatch(command: ListNavigationCommand): boolean {
    if (isEmpty()) {
      return false
    }

    const len = items.length
    const current = activeIndex.value

    if (command === 'activate') {
      const el = getActiveItem()
      if (!el) {
        return false
      }

      if (typeof options.onActivateItem === 'function') {
        options.onActivateItem(el)
      } else {
        el.click()
      }
      return true
    }

    if (command === 'leave-parent') {
      if (typeof options.onLeft !== 'function') {
        return false
      }

      options.onLeft()
      return true
    }

    if (command === 'enter-child') {
      const el = getActiveItem()
      if (!el || !options.onRight) {
        return false
      }

      options.onRight(el)
      return true
    }

    let next: number
    if (command === 'first') {
      next = findNextIndex(len, -1, 1, false)
    } else if (command === 'last') {
      next = findNextIndex(len, len, -1, false)
    } else {
      const dir = command === 'next' ? 1 : -1

      next =
        current === -1
          ? findNextIndex(len, dir === 1 ? -1 : len, dir, false)
          : findNextIndex(len, current, dir, getLoop())
    }

    if (next === -1) {
      return false
    }

    if (next !== current) {
      options.onToggle?.(next)
      setActiveIndex(next)
      items[next]?.scrollIntoView({ block: 'nearest' })
    }

    return true
  }

  return {
    activeIndex,
    setActiveIndex,
    registerItem,
    unregisterItem,
    dispatch,
    onPointerOver,
    refreshItems,
    setFirstAsActive,
    isEmpty,
  }
}
