import type { VirtualItem } from '@tanstack/virtual-core'
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
} from '@tanstack/virtual-core'
import type { ComponentPublicInstance } from 'vue'
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'

import type { MaybeElementRef } from '../types/shared'
import { toValue } from '../utils/ref'

export type { VirtualItem }

export interface VirtualListOptions {
  dataKey?: string
  listData?: any[]
  itemSize?: number
  overScan?: number
}

const DEFAULT_ITEM_SIZE = 50
const DEFAULT_OVER_SCAN = 2

export function useVirtualList<Options extends VirtualListOptions>(
  containerRef: MaybeElementRef<HTMLElement>,
  options: Options,
) {
  const triggerVersion = shallowRef(0)
  let cleanup: (() => void) | undefined

  function getItemKey(index: number): string | number {
    if (options.dataKey) {
      const item = options.listData?.[index]
      const key = item?.[options.dataKey]
      if (key !== undefined && key !== null) {
        return key
      }
    }
    return index
  }

  const virtualizer = new Virtualizer<HTMLElement, HTMLElement>({
    count: options.listData?.length ?? 0,
    getScrollElement: () => toValue(containerRef) ?? null,
    estimateSize: () => options.itemSize || DEFAULT_ITEM_SIZE,
    getItemKey,
    overscan: options.overScan ?? DEFAULT_OVER_SCAN,
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    onChange: () => {
      triggerVersion.value++
    },
  })

  const virtualItems = computed<VirtualItem[]>(() => {
    void triggerVersion.value
    return virtualizer.getVirtualItems()
  })

  const totalSize = computed(() => {
    void triggerVersion.value
    return virtualizer.getTotalSize()
  })

  watch(
    () => [options.listData, options.itemSize, options.dataKey] as const,
    () => {
      virtualizer.setOptions({
        ...virtualizer.options,
        count: options.listData?.length ?? 0,
        estimateSize: () => options.itemSize ?? DEFAULT_ITEM_SIZE,
        getItemKey,
      })
      virtualizer._willUpdate()
    },
  )

  onMounted(() => {
    virtualizer._willUpdate()
    cleanup = virtualizer._didMount()
  })

  onUnmounted(() => {
    cleanup?.()
  })

  function measureElement(el: Element | ComponentPublicInstance | null) {
    if (!el) {
      virtualizer.measureElement(null)
      return
    }

    const htmlEl = el instanceof HTMLElement ? el : (el as ComponentPublicInstance).$el
    virtualizer.measureElement(htmlEl)
  }

  return {
    virtualItems,
    totalSize,
    measureElement,
    scrollToIndex: virtualizer.scrollToIndex.bind(virtualizer),
    scrollToOffset: virtualizer.scrollToOffset.bind(virtualizer),
    scrollBy: virtualizer.scrollBy.bind(virtualizer),
    getVirtualizer: () => virtualizer,
  }
}
