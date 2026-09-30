import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { shallowRef } from 'vue'
import { useVirtualList } from '../../src/composables/use-virtual-list'
import { useSetupWrapper } from '../helpers/setup'

describe('useVirtualList', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return expected API', () => {
    const container = document.createElement('div')
    const {
      virtualItems,
      totalSize,
      measureElement,
      scrollToIndex,
      scrollToOffset,
      scrollBy,
      unmount,
    } = useSetupWrapper(() =>
      useVirtualList(() => container, { dataKey: 'id', items: [], itemSize: 50 }),
    )

    expect(virtualItems).toBeDefined()
    expect(totalSize).toBeDefined()
    expect(typeof measureElement).toBe('function')
    expect(typeof scrollToIndex).toBe('function')
    expect(typeof scrollToOffset).toBe('function')
    expect(typeof scrollBy).toBe('function')
    unmount()
  })

  it('should compute totalSize for empty list', () => {
    const container = document.createElement('div')
    const { totalSize, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, { dataKey: 'id', items: [], itemSize: 50 }),
    )

    expect(totalSize.value).toBe(0)
    unmount()
  })

  it('should compute totalSize for populated list', () => {
    const container = document.createElement('div')
    const data = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    const { totalSize, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, { dataKey: 'id', items: data, itemSize: 50 }),
    )

    expect(totalSize.value).toBeGreaterThanOrEqual(0)
    unmount()
  })

  it('should accept custom itemSize', () => {
    const container = document.createElement('div')
    const { totalSize, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, { dataKey: 'id', items: [], itemSize: 80 }),
    )

    expect(totalSize).toBeDefined()
    unmount()
  })

  it('should accept columnCount', () => {
    const container = document.createElement('div')
    const { totalSize, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, {
        dataKey: 'id',
        items: [],
        itemSize: 50,
        columnCount: 2,
      }),
    )

    expect(totalSize).toBeDefined()
    unmount()
  })

  it('should pass scrollPaddingStart/scrollPaddingEnd to the virtualizer', () => {
    const container = document.createElement('div')
    const { getVirtualizer, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, {
        dataKey: 'id',
        items: [],
        itemSize: 50,
        scrollPaddingStart: 60,
        scrollPaddingEnd: 40,
      }),
    )

    const virtualizer = getVirtualizer()
    expect(virtualizer.options.scrollPaddingStart).toBe(60)
    expect(virtualizer.options.scrollPaddingEnd).toBe(40)
    unmount()
  })

  it('should default scrollPadding to 0 when not provided', () => {
    const container = document.createElement('div')
    const { getVirtualizer, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, { dataKey: 'id', items: [], itemSize: 50 }),
    )

    const virtualizer = getVirtualizer()
    expect(virtualizer.options.scrollPaddingStart).toBe(0)
    expect(virtualizer.options.scrollPaddingEnd).toBe(0)
    unmount()
  })

  it('should keep scrollPadding after a reactive options update', () => {
    const container = document.createElement('div')
    const items = shallowRef([{ id: 0 }, { id: 1 }])
    const { getVirtualizer, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, {
        dataKey: 'id',
        get items() {
          return items.value
        },
        itemSize: 50,
        scrollPaddingStart: 60,
        scrollPaddingEnd: 40,
      }),
    )

    items.value = [{ id: 0 }, { id: 1 }, { id: 2 }]
    expect(getVirtualizer().options.scrollPaddingStart).toBe(60)
    expect(getVirtualizer().options.scrollPaddingEnd).toBe(40)
    unmount()
  })
})
