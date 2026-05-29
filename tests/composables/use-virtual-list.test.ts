import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
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
      useVirtualList(() => container, { dataKey: 'id', listData: [], itemSize: 50 }),
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
      useVirtualList(() => container, { dataKey: 'id', listData: [], itemSize: 50 }),
    )

    expect(totalSize.value).toBe(0)
    unmount()
  })

  it('should compute totalSize for populated list', () => {
    const container = document.createElement('div')
    const data = Array.from({ length: 10 }, (_, i) => ({ id: i }))
    const { totalSize, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, { dataKey: 'id', listData: data, itemSize: 50 }),
    )

    expect(totalSize.value).toBeGreaterThanOrEqual(0)
    unmount()
  })

  it('should accept custom itemSize', () => {
    const container = document.createElement('div')
    const { totalSize, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, { dataKey: 'id', listData: [], itemSize: 80 }),
    )

    expect(totalSize).toBeDefined()
    unmount()
  })

  it('should accept columnCount', () => {
    const container = document.createElement('div')
    const { totalSize, unmount } = useSetupWrapper(() =>
      useVirtualList(() => container, {
        dataKey: 'id',
        listData: [],
        itemSize: 50,
        columnCount: 2,
      }),
    )

    expect(totalSize).toBeDefined()
    unmount()
  })
})
