import type { MaybeElementRef } from '../types/shared'
import type { VirtualItem } from '@tanstack/virtual-core'
import type { ComponentPublicInstance } from 'vue'
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
} from '@tanstack/virtual-core'
import { computed, onMounted, onUnmounted, shallowRef, watch } from 'vue'
import { toValue } from '../utils/ref'

export interface VirtualListItem extends VirtualItem {
  key: string | number
}

const DEFAULTS = {
  status: '',
  itemSize: 50,
  overScan: 2,
} as const

export interface VirtualListOptions {
  status?: 'loading' | 'finished' | 'error' | ''
  dataKey?: string
  listData?: any[]
  itemSize?: number
  overScan?: number
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
    estimateSize: () => options.itemSize ?? DEFAULTS.itemSize,
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
          onBottom()
        }
      } else {
        reachBottomFired = false
      }
    },
  })

  const virtualItems = computed<VirtualListItem[]>(() => {
    void triggerVersion.value
    return virtualizer.getVirtualItems() as VirtualListItem[]
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
