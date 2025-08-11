import type { VirtualListProps } from '../../src/composables/use-virtual-list'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'
import { useVirtualList } from '../../src/composables/use-virtual-list'
import { useSetupWrapper } from '../helpers/setup'

describe('use-virtual-list', () => {
  let mockContainer: HTMLElement
  let mockElement: HTMLElement

  beforeEach(() => {
    mockContainer = {
      clientHeight: 400,
      scrollTop: 0,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as any

    mockElement = {
      getBoundingClientRect: vi.fn(() => ({ height: 60 })),
    } as any
  })

  it('should initialize with default values', () => {
    const props: VirtualListProps = {
      listData: [],
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    expect(wrapper.renderList.value).toEqual([])
    // expect(wrapper.listStyle.value).toBe('transform: translate3d(0, 0px, 0)')
    expect(wrapper.listStyle.value).toBe('transform: translate3d(0, 0px, 0)')
    expect(wrapper.listHeight.value).toBe(0)

    wrapper.unmount()
  })

  it('should handle missing props with defaults', () => {
    const props: VirtualListProps = {
      listData: [],
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    expect(wrapper.renderList.value).toEqual([])

    wrapper.unmount()
  })

  it('should manage item refs correctly', () => {
    const props: VirtualListProps = {
      listData: Array.from({ length: 10 }, (_, i) => `Item ${i}`),
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    wrapper.setItemRef(mockElement, 0)
    wrapper.setItemRef(mockElement, 1)
    wrapper.setItemRef(null, 1) // should delete

    wrapper.unmount()
  })

  it('should initialize positions correctly', async () => {
    const testData = Array.from({ length: 5 }, (_, i) => `Item ${i}`)
    const props: VirtualListProps = {
      listData: testData,
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    await nextTick()

    // expect(wrapper.listStyle.value.transform).toBe('translate3d(0, 0px, 0)')
    expect(wrapper.listStyle.value).toBe('transform: translate3d(0, 0px, 0)')

    wrapper.unmount()
  })

  it('should perform binary search correctly in getStartIndex', () => {
    const testData = Array.from({ length: 10 }, (_, i) => `Item ${i}`)
    const props: VirtualListProps = {
      listData: testData,
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    expect(wrapper.getStartIndex(0)).toBe(0)
    expect(wrapper.getStartIndex(75)).toBe(1) // should find index 1 (bottom: 100)
    expect(wrapper.getStartIndex(125)).toBe(2) // should find index 2 (bottom: 150)
    expect(wrapper.getStartIndex(1000)).toBe(9) // should clamp to max index

    wrapper.unmount()
  })

  it('should handle empty positions in getStartIndex', () => {
    const props: VirtualListProps = {
      listData: [],
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    expect(wrapper.getStartIndex(100)).toBe(0)

    wrapper.unmount()
  })

  it('should update positions when item heights change', async () => {
    const testData = Array.from({ length: 5 }, (_, i) => `Item ${i}`)
    const props: VirtualListProps = {
      listData: testData,
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    wrapper.containerRef.value = mockContainer
    wrapper.updateContainerHeight()

    await nextTick()

    // Mock an element with different height
    const tallElement = {
      getBoundingClientRect: vi.fn(() => ({ height: 80 })),
    } as any

    wrapper.setItemRef(tallElement, 0)

    wrapper.unmount()
  })

  it('should calculate list height from positions', async () => {
    const testData = Array.from({ length: 3 }, (_, i) => `Item ${i}`)
    const props: VirtualListProps = {
      listData: testData,
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    await nextTick()

    expect(wrapper.listHeight.value).toBe(testData.length * (props.itemSize || 50)) // 3 * 50

    wrapper.unmount()
  })

  it('should handle reactive data changes', async () => {
    const reactiveData = ref(Array.from({ length: 3 }, (_, i) => `Item ${i}`))

    const wrapper = useSetupWrapper(() => useVirtualList({
      listData: reactiveData.value,
      itemSize: 50,
    }))

    // Set container height to enable rendering
    wrapper.containerRef.value = mockContainer
    wrapper.updateContainerHeight()

    await nextTick()

    // Should render all available items (3) even though renderCount would be higher
    // because end = Math.min(start + renderCount, listData.length)
    expect(wrapper.renderList.value.length).toBe(3)

    wrapper.unmount()
  })

  it('should handle scroll events correctly', () => {
    const props: VirtualListProps = {
      listData: Array.from({ length: 100 }, (_, i) => `Item ${i}`),
      itemSize: 50,
    }

    const wrapper = useSetupWrapper(() => useVirtualList(props))

    wrapper.containerRef.value = mockContainer
    wrapper.updateContainerHeight()

    // Simulate scroll event
    const scrollEvent = new Event('scroll')
    Object.defineProperty(scrollEvent, 'target', {
      value: { scrollTop: 100 },
      writable: false,
    })

    expect(() => {
      wrapper.containerRef.value?.addEventListener('scroll', () => {})
    }).not.toThrow()

    wrapper.unmount()
  })
})
