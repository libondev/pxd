import type { VirtualItem } from '@tanstack/virtual-core'
import type { ComponentPublicInstance } from 'vue'

import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
} from '@tanstack/virtual-core'
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'

import type { MaybeElementRef } from '../types/shared'

import { toValue } from '../utils/ref'

export type VirtualListItem = VirtualItem
export type VirtualListStatus = 'loading' | 'finished' | 'error' | '' | null | undefined

const DEFAULTS = {
  status: '',
  itemSize: 50,
  overScan: 2,
  reachBottomThreshold: 50,
} as const

export interface VirtualListOptions {
  status?: VirtualListStatus
  dataKey?: string
  listData?: any[]
  itemSize?: number
  overScan?: number
  onReachBottom?: () => void | Promise<void>
  reachBottomThreshold?: number
}

export function useVirtualList<Options extends VirtualListOptions>(
  containerRef: MaybeElementRef<HTMLElement>,
  options: Options,
) {
  let reachBottomFired = false
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
    estimateSize: () => options.itemSize || DEFAULTS.itemSize,
    getItemKey,
    overscan: options.overScan ?? DEFAULTS.overScan,
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    onChange: (instance) => {
      triggerVersion.value++

      const { status = DEFAULTS.status, listData } = options

      if (status || listData?.length === 0) {
        return
      }

      const { onReachBottom, reachBottomThreshold = DEFAULTS.reachBottomThreshold } = options

      if (!onReachBottom) {
        return
      }

      const { scrollOffset, scrollRect } = instance
      if (scrollOffset === null || scrollRect === null) {
        return
      }

      const totalSize = instance.getTotalSize()
      const scrollBottom = scrollOffset + scrollRect.height

      if (scrollBottom >= totalSize - reachBottomThreshold) {
        if (!reachBottomFired) {
          reachBottomFired = true
          onReachBottom()
        }
      } else {
        reachBottomFired = false
      }
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

  function updateVirtualizer() {
    virtualizer.setOptions({
      ...virtualizer.options,
      count: options.listData?.length ?? 0,
      estimateSize: () => options.itemSize ?? DEFAULTS.itemSize,
      getItemKey,
    })

    virtualizer._willUpdate()
    triggerVersion.value++
  }

  watch(() => [options.itemSize, options.dataKey], updateVirtualizer)

  watch(() => [options.listData, options.listData?.length], updateVirtualizer)

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
