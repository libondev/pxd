import type { MaybeRefOrGetter, ShallowRef } from 'vue'
import { shallowRef, watch } from 'vue'
import { toValue } from '../../utils/helper.js'

export interface UseListNavigationOptions {
  loop?: MaybeRefOrGetter<boolean>
  defaultActiveIndex?: MaybeRefOrGetter<number>
  /** Number of navigable items (headers excluded). */
  count: MaybeRefOrGetter<number>
  isDisabled?: (index: number) => boolean
  onActivateItem?: (index: number) => void
  onLeft?: () => void
  onRight?: (index: number) => void
  onActivate?: () => void
  scrollToIndex?: (index: number) => void
  /** Selector used by pointerover to find a list item. */
  itemSelector?: MaybeRefOrGetter<string>
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
  dispatch: (command: ListNavigationCommand) => boolean
  onPointerOver: (ev: PointerEvent) => boolean
  setFirstAsActive: () => void
  isEmpty: () => boolean
}

function findNextIndex(
  len: number,
  from: number,
  dir: 1 | -1,
  loop: boolean,
  isDisabled?: (index: number) => boolean,
): number {
  if (len === 0) {
    return -1
  }

  let i = from
  for (let step = 0; step < len; step++) {
    i = i + dir

    if (loop) {
      i = ((i % len) + len) % len
    } else if (i < 0 || i >= len) {
      return -1
    }

    if (!isDisabled?.(i)) {
      return i
    }
  }

  return -1
}

export function useListNavigation(options: UseListNavigationOptions): UseListNavigationReturn {
  const getLoop = () => toValue(options.loop) ?? true
  const getDefaultActiveIndex = () => toValue(options.defaultActiveIndex) ?? -1
  const getCount = () => toValue(options.count) ?? 0
  const getItemSelector = () => toValue(options.itemSelector) ?? '[data-list-item]'

  const activeIndex = shallowRef(getDefaultActiveIndex())

  let lastPointerX = -1
  let lastPointerY = -1

  function clampActiveIndex() {
    const len = getCount()
    const fallback = getDefaultActiveIndex()

    if (len === 0) {
      activeIndex.value = -1
      return
    }

    if (activeIndex.value >= len) {
      activeIndex.value = len - 1
    }

    if (activeIndex.value === -1 && fallback >= 0 && fallback < len) {
      if (!options.isDisabled?.(fallback)) {
        activeIndex.value = fallback
      }
    }

    if (activeIndex.value >= 0 && options.isDisabled?.(activeIndex.value)) {
      const next = findNextIndex(len, activeIndex.value - 1, 1, false, options.isDisabled)
      activeIndex.value = next
    }
  }

  watch(() => getCount(), clampActiveIndex, { immediate: true })

  function setActiveIndex(index: number): void {
    const len = getCount()

    if (index < -1 || index >= len) {
      return
    }

    if (index >= 0 && options.isDisabled?.(index)) {
      return
    }

    activeIndex.value = index
  }

  function setFirstAsActive(): void {
    setActiveIndex(findNextIndex(getCount(), -1, 1, false, options.isDisabled))
  }

  function isEmpty(): boolean {
    return getCount() === 0
  }

  function onPointerOver(ev: PointerEvent): boolean {
    if (ev.pageX === lastPointerX && ev.pageY === lastPointerY) {
      return false
    }
    lastPointerX = ev.pageX
    lastPointerY = ev.pageY

    const listItem = (ev.target as HTMLElement).closest<HTMLElement>(getItemSelector())
    if (!listItem || listItem.dataset.disabled === 'true') {
      return false
    }

    const raw = listItem.dataset.index
    if (raw === undefined) {
      return false
    }

    const index = Number(raw)
    if (!Number.isFinite(index) || index < 0 || index >= getCount()) {
      return false
    }

    options.onActivate?.()
    setActiveIndex(index)
    return true
  }

  function dispatch(command: ListNavigationCommand): boolean {
    if (isEmpty()) {
      return false
    }

    const len = getCount()
    const current = activeIndex.value

    if (command === 'activate') {
      if (current < 0 || current >= len || options.isDisabled?.(current)) {
        return false
      }

      options.onActivateItem?.(current)
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
      if (current < 0 || current >= len || !options.onRight) {
        return false
      }

      options.onRight(current)
      return true
    }

    let next: number
    if (command === 'first') {
      next = findNextIndex(len, -1, 1, false, options.isDisabled)
    } else if (command === 'last') {
      next = findNextIndex(len, len, -1, false, options.isDisabled)
    } else {
      const dir = command === 'next' ? 1 : -1

      next =
        current === -1
          ? findNextIndex(len, dir === 1 ? -1 : len, dir, false, options.isDisabled)
          : findNextIndex(len, current, dir, getLoop(), options.isDisabled)
    }

    if (next === -1) {
      return false
    }

    if (next !== current) {
      setActiveIndex(next)
      options.scrollToIndex?.(next)
    }

    return true
  }

  return {
    activeIndex,
    setActiveIndex,
    dispatch,
    onPointerOver,
    setFirstAsActive,
    isEmpty,
  }
}
