import type { MaybeElementRef } from '../types/shared/utils'
import type { VirtualItem } from '@tanstack/virtual-core'
import type { ComponentPublicInstance, MaybeRefOrGetter } from 'vue'
import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  Virtualizer,
} from '@tanstack/virtual-core'
import { computed, nextTick, onMounted, onScopeDispose, watch, shallowRef } from 'vue'
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
  items?: readonly any[]
  itemSize?: number | ((index: number) => number)
  overScan?: number
  columnGap?: number
  columnCount?: number
  scrollPaddingStart?: number
  scrollPaddingEnd?: number
  onBottom?: () => void | Promise<void>
  bottomThreshold?: number
  /**
   * Something holds the bottom of the viewport. Its size is final for the frame when this fires and
   * `nextTick` reaches it, so rows are measured before the paint instead of on the resize delivery
   * that would follow it.
   */
  onGeometryChange?: () => void
}

export interface VirtualListScrollToOptions {
  /** Scroll animation for the jump. */
  behavior?: ScrollBehavior
}

/**
 * Position and scroll operations for a data-driven outline. Implementations must read reactive
 * state (e.g. a layout version) inside the getters, so `PToc` re-evaluates tracking whenever the
 * scroll position or item measurements change.
 */
export interface VirtualListScrollSource {
  /** Scroll offset that aligns `index` with the top of the viewport, or undefined while unknown. */
  getOffsetForIndex: (index: number) => number | undefined
  /** Current scroll offset of the container, or null while unavailable. */
  getScrollOffset: () => number | null
  /** Furthest scroll offset the container can reach. */
  getMaxScrollOffset: () => number
  /** Scroll `index` to the top of the viewport. */
  scrollToIndex: (index: number, options?: VirtualListScrollToOptions) => void
}

export function useVirtualList<Options extends VirtualListOptions>(
  containerRef: MaybeElementRef<HTMLElement>,
  options: Options,
) {
  let reachBottomFired = false
  let cleanup: (() => void) | undefined
  let reportedTotal = -1
  let measureQueued = false
  let lastItems: readonly VirtualItem[] | undefined
  let lastTotal = -1

  const triggerVersion = shallowRef(0)

  const getEnabled = () => toValue(options.enabled) !== false

  function getItemSize(index: number) {
    const size = options.itemSize

    return typeof size === 'function' ? size(index) : (size ?? DEFAULTS.itemSize)
  }

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

  // Every reactive mirror below derives from an imperative cache, and a holder of the bottom has to
  // hear about a finished layout before the frame paints.
  function bumpGeometry() {
    // The measurement cache is memoized on count and options, so the total is stale until a read
    const items = virtualizer.getVirtualItems()
    const total = virtualizer.getTotalSize()

    if (items !== lastItems || total !== lastTotal) {
      lastItems = items
      lastTotal = total
      triggerVersion.value++
    }

    const notify = options.onGeometryChange

    if (!notify || total === reportedTotal) {
      return
    }

    reportedTotal = total
    void nextTick(notify)
  }

  const virtualizer = new Virtualizer<HTMLElement, HTMLElement>({
    count: 0,
    getScrollElement: () => (getEnabled() ? (toValue(containerRef) ?? null) : null),
    estimateSize: getItemSize,
    getItemKey,
    overscan: options.overScan ?? DEFAULTS.overScan,
    lanes: options.columnCount ?? DEFAULTS.columnCount,
    gap: options.columnGap ?? DEFAULTS.columnGap,
    scrollPaddingStart: options.scrollPaddingStart,
    scrollPaddingEnd: options.scrollPaddingEnd,
    laneAssignmentMode: 'measured',
    // A measurement written inside the observer's own delivery re-triggers it: the item's new size
    // moves the container, whose resize the same pass is still reporting, and Chromium gives up on
    // the rest of the frame ("ResizeObserver loop completed with undelivered notifications"). The
    // option moves both observer writes - the container rect and the item measurements - to the
    // next frame, which is where a measurement belongs anyway.
    useAnimationFrameWithResizeObserver: true,
    useScrollendEvent: true,
    observeElementRect,
    observeElementOffset,
    scrollToFn: elementScroll,
    onChange: (instance) => {
      if (!getEnabled()) {
        return
      }

      bumpGeometry()

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
      const threshold =
        bottomThreshold ?? (typeof itemSize === 'number' ? itemSize : DEFAULTS.itemSize)
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

  // `getVirtualItems()` refreshes the measurements cache, normally a render's job; the version
  // read makes the getters reactive per the `VirtualListScrollSource` contract.
  function refreshMeasurements() {
    void triggerVersion.value
    virtualizer.getVirtualItems()
  }

  const scrollSource: VirtualListScrollSource = {
    getOffsetForIndex(index) {
      refreshMeasurements()
      return virtualizer.getOffsetForIndex(index, 'start')?.[0]
    },
    getScrollOffset() {
      refreshMeasurements()
      return virtualizer.scrollOffset
    },
    getMaxScrollOffset() {
      refreshMeasurements()
      return Math.max(virtualizer.getTotalSize() - (virtualizer.scrollRect?.height ?? 0), 0)
    },
    scrollToIndex(index, options) {
      virtualizer.getVirtualItems()
      virtualizer.scrollToIndex(index, { align: 'start', behavior: options?.behavior })
    },
  }

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

  const pendingMeasure = new Set<HTMLElement>()

  // Reads first, writes after: a patch costs one layout instead of one per row, and the sizes land
  // before the paint a holder of the bottom would otherwise correct a frame later.
  function flushMeasure() {
    const sizes: Array<[number, number]> = []

    pendingMeasure.forEach((el) => {
      const size = el.offsetHeight

      if (size) {
        sizes.push([virtualizer.indexFromElement(el), size])
      }
    })

    pendingMeasure.clear()

    for (const [index, size] of sizes) {
      virtualizer.resizeItem(index, size)
    }
  }

  function scheduleMeasure() {
    if (measureQueued) {
      return
    }

    measureQueued = true
    void nextTick(() => {
      measureQueued = false
      flushMeasure()
    })
  }

  function measureElement(el: Element | ComponentPublicInstance | null) {
    if (!el) {
      virtualizer.measureElement(null)
      return
    }

    if (!getEnabled()) {
      return
    }

    const htmlEl = el instanceof HTMLElement ? el : (el as ComponentPublicInstance).$el
    virtualizer.measureElement(htmlEl)

    // The virtualizer skips its own ref-time read while it believes it is scrolling, and a holder
    // of the bottom scrolls on every growth: the window this mounts would paint at estimates.
    if (options.onGeometryChange) {
      pendingMeasure.add(htmlEl)
      scheduleMeasure()
    }
  }

  // Options, count and observer lifetime move together: one entry point keeps `_willUpdate` from
  // running against a container the observers no longer watch.
  function sync() {
    const enabled = getEnabled()

    virtualizer.setOptions({
      ...virtualizer.options,
      count: enabled ? (options.items?.length ?? 0) : 0,
      overscan: options.overScan ?? DEFAULTS.overScan,
      lanes: options.columnCount ?? DEFAULTS.columnCount,
      gap: options.columnGap ?? DEFAULTS.columnGap,
    })

    if (!enabled) {
      cleanup?.()
      cleanup = undefined
      pendingMeasure.clear()
      bumpGeometry()

      return
    }

    virtualizer._willUpdate()

    if (!cleanup) {
      cleanup = virtualizer._didMount()
    }

    bumpGeometry()
  }

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

  watch(
    () => [
      getEnabled(),
      typeof options.itemSize === 'function' ? 'fn' : options.itemSize,
      options.dataKey,
      options.columnCount,
      options.columnGap,
      options.overScan,
      options.items,
      options.items?.length,
    ],
    sync,
  )

  onMounted(sync)

  onScopeDispose(() => {
    cleanup?.()
    cleanup = undefined
    pendingMeasure.clear()
    triggerVersion.value++
  })

  return {
    virtualItems,
    totalSize,
    measureElement,
    scrollToIndex,
    scrollToOffset,
    scrollBy,
    scrollSource,
    getVirtualizer: () => virtualizer,
  }
}
