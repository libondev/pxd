import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef } from 'vue'
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
  refreshItems: () => void
  setFirstAsActive: () => void
  isEmpty: () => boolean
}

const KEY_DIRECTION: Record<string, -1 | 1 | undefined> = {
  ArrowUp: -1,
  ArrowLeft: -1,
  ArrowDown: 1,
  ArrowRight: 1,
}

const isDisabled = (el: HTMLElement): boolean => el.dataset.disabled === 'true'

function findEnabledIndex(items: HTMLElement[], from: number, dir: 1 | -1, loop: boolean): number {
  const len = items.length
  if (len === 0) {
    return -1
  }

  let i = from
  for (let step = 0; step < len; step++) {
    if (loop) {
      i = (i + dir + len) % len
    } else {
      i += dir
      if (i < 0 || i >= len) {
        return -1
      }
    }
    if (!isDisabled(items[i])) {
      return i
    }
  }
  return -1
}

export function useListNavigation(
  containerRef: MaybeRefOrGetter<HTMLElement | undefined>,
  options: UseListNavigationOptions,
): UseListNavigationReturn {
  const getLoop = () => toValue(options.loop) ?? true
  const getToggleOnKeyPress = () => toValue(options.toggleOnKeyPress) ?? true
  const getDefaultActiveIndex = () => toValue(options.defaultActiveIndex) ?? -1
  const getItemSelector = () => toValue(options.itemSelector) ?? '.pxd-list-item'

  const activeIndex = shallowRef(getDefaultActiveIndex())
  const itemIndexRefs = new WeakMap<HTMLElement, ShallowRef<number>>()

  let items: HTMLElement[] = []
  let lastPointerX = -1
  let lastPointerY = -1

  function refreshItems(): void {
    const container = unrefElement(containerRef)
    items = container ? Array.from(container.querySelectorAll<HTMLElement>(getItemSelector())) : []

    items.forEach((el, i) => {
      const ref = itemIndexRefs.get(el)
      if (ref) {
        ref.value = i
      }
    })

    const fallback = getDefaultActiveIndex()
    if (activeIndex.value === -1 && fallback >= 0 && fallback < items.length) {
      activeIndex.value = fallback
    }
  }

  function setActiveIndex(index: number): void {
    activeIndex.value = index
  }

  function setFirstAsActive(): void {
    activeIndex.value = findEnabledIndex(items, -1, 1, false)
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
    activeIndex.value = Math.min(activeIndex.value, items.length - 1)
  }

  function onPointerOver(ev: PointerEvent): void {
    if (ev.pageX === lastPointerX && ev.pageY === lastPointerY) {
      return
    }
    lastPointerX = ev.pageX
    lastPointerY = ev.pageY

    const listItem = (ev.target as HTMLElement).closest<HTMLElement>(getItemSelector())
    if (!listItem || isDisabled(listItem)) {
      return
    }

    const index = items.indexOf(listItem)
    if (index !== -1) {
      activeIndex.value = index
    }
  }

  function onKeydown(ev: KeyboardEvent): void {
    if (!getToggleOnKeyPress() || items.length === 0) {
      return
    }

    const { key, ctrlKey, metaKey, altKey, shiftKey } = ev
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
      if (!el || isDisabled(el)) {
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
      next = findEnabledIndex(items, -1, 1, false)
    } else if (key === 'End') {
      next = findEnabledIndex(items, len, -1, false)
    } else {
      const dir = KEY_DIRECTION[key]
      if (!dir) {
        return
      }

      next =
        current === -1
          ? findEnabledIndex(items, dir === 1 ? -1 : len, dir, false)
          : findEnabledIndex(items, current, dir, getLoop())
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
