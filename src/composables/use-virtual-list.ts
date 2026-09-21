import type { MaybeElementRef } from '../types/shared'
import type { VirtualItem } from '@tanstack/virtual-core'
import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
} from '@tanstack/virtual-core'
import { computed, onMounted, onScopeDispose, watch, shallowRef } from 'vue'
import { toValue } from '../utils/helper.js'
import { isNil } from '../utils/is.js'

export interface VirtualListItem extends VirtualItem {
  key: string | number
}

const DEFAULTS = {
  status: '',
  itemSize: 50,
  overScan: 2,
  columnGap: 0,
  columnCount: 1,
} as const

export interface VirtualListOptions {
  enabled?: MaybeRefOrGetter<boolean>
  status?: 'loading' | 'finished' | 'error' | ''
  dataKey?: string
  items?: any[]
  itemSize?: number
  overScan?: number
  columnGap?: number
  columnCount?: number
  onBottom?: () => void | Promise<void>
  bottomThreshold?: number
}

export function useVirtualList<Options extends VirtualListOptions>(
  containerRef: MaybeElementRef<HTMLElement>,
  options: Options,
) {
  let reachBottomFired = false
  let cleanup: (() => void) | undefined

  const triggerVersion = shallowRef(0)

  const getEnabled = () => toValue(options.enabled) !== false

  function getItemKey(index: number): string | number {
    if (options.dataKey) {
      const item = options.items?.[index]
      const key = item?.[options.dataKey]
      if (!isNil(key)) {
        return key
      }
    }

    return index
  }

  const virtualizer = new Virtualizer<HTMLElement, HTMLElement>({
    count: 0,
    getScrollElement: () => (getEnabled() ? (toValue(containerRef) ?? null) : null),
    estimateSize: () => options.itemSize ?? DEFAULTS.itemSize,
    getItemKey,
    overscan: options.overScan ?? DEFAULTS.overScan,
    lanes: options.columnCount ?? DEFAULTS.columnCount,
    gap: options.columnGap ?? DEFAULTS.columnGap,
    laneAssignmentMode: 'measured',
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    onChange: (instance) => {
      if (!getEnabled()) {
        return
      }

      triggerVersion.value++

      const { status = DEFAULTS.status, items } = options

      if (status || items?.length === 0) {
        return
      }

      const { onBottom, itemSize = DEFAULTS.itemSize, bottomThreshold } = options

      if (!onBottom) {
        return
      }

      const { scrollOffset, scrollRect } = instance
      if (scrollOffset === null || scrollRect === null) {
        return
      }

      const totalSize = instance.getTotalSize()
      const threshold = bottomThreshold ?? itemSize
      const scrollBottom = scrollOffset + scrollRect.height

      if (scrollBottom >= totalSize - threshold) {
        if (!reachBottomFired) {
          reachBottomFired = true
          void onBottom()
        }
      } else {
        reachBottomFired = false
      }
    },
  })

  const virtualItems = computed<VirtualListItem[]>(() => {
    void triggerVersion.value
    if (!getEnabled()) {
      return []
    }
    return virtualizer.getVirtualItems() as VirtualListItem[]
  })

  const totalSize = computed(() => {
    void triggerVersion.value
    if (!getEnabled()) {
      return 0
    }
    return virtualizer.getTotalSize()
  })

  function measureElement(el: Element | ComponentPublicInstance | null) {
    if (!getEnabled()) {
      return
    }

    if (!el) {
      virtualizer.measureElement(null)
      return
    }

    const htmlEl = el instanceof HTMLElement ? el : (el as ComponentPublicInstance).$el
    virtualizer.measureElement(htmlEl)
  }

  function updateVirtualizer() {
    const enabled = getEnabled()

    virtualizer.setOptions({
      ...virtualizer.options,
      count: enabled ? (options.items?.length ?? 0) : 0,
      estimateSize: () => options.itemSize ?? DEFAULTS.itemSize,
      getItemKey,
      overscan: options.overScan ?? DEFAULTS.overScan,
      lanes: options.columnCount ?? DEFAULTS.columnCount,
      gap: options.columnGap ?? DEFAULTS.columnGap,
      getScrollElement: () => (enabled ? (toValue(containerRef) ?? null) : null),
    })

    if (enabled) {
      virtualizer._willUpdate()
    }

    triggerVersion.value++
  }

  function mountObservers() {
    if (cleanup || !getEnabled()) {
      return
    }

    virtualizer._willUpdate()
    cleanup = virtualizer._didMount()
  }

  function unmountObservers() {
    cleanup?.()
    cleanup = undefined
    triggerVersion.value++
  }

  watch(
    () => [
      getEnabled(),
      options.itemSize,
      options.dataKey,
      options.columnCount,
      options.columnGap,
      options.overScan,
    ],
    () => {
      if (getEnabled()) {
        updateVirtualizer()
        mountObservers()
      } else {
        unmountObservers()
        updateVirtualizer()
      }
    },
  )
  watch(() => [options.items, options.items?.length], updateVirtualizer)

  onMounted(() => {
    if (getEnabled()) {
      mountObservers()
      updateVirtualizer()
    }
  })

  onScopeDispose(() => {
    unmountObservers()
  })

  function scrollToIndex(...args: Parameters<typeof virtualizer.scrollToIndex>) {
    if (!getEnabled()) {
      return
    }
    virtualizer.scrollToIndex(...args)
  }

  function scrollToOffset(...args: Parameters<typeof virtualizer.scrollToOffset>) {
    if (!getEnabled()) {
      return
    }
    virtualizer.scrollToOffset(...args)
  }

  function scrollBy(...args: Parameters<typeof virtualizer.scrollBy>) {
    if (!getEnabled()) {
      return
    }
    virtualizer.scrollBy(...args)
  }

  return {
    virtualItems,
    totalSize,
    measureElement,
    scrollToIndex,
    scrollToOffset,
    scrollBy,
    getVirtualizer: () => virtualizer,
  }
}
