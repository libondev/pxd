import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { shallowRef } from 'vue'
import { useListNavigation } from '../../src/composables/use-list-navigation'

describe('useListNavigation', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return expected API', () => {
    const containerRef = shallowRef<HTMLElement | undefined>(undefined)
    const result = useListNavigation(containerRef, {
      loop: true,
    })

    expect(result.activeIndex).toBeDefined()
    expect(typeof result.setActiveIndex).toBe('function')
    expect(typeof result.registerItem).toBe('function')
    expect(typeof result.unregisterItem).toBe('function')
    expect(typeof result.onKeydown).toBe('function')
    expect(typeof result.onPointerOver).toBe('function')
    expect(typeof result.refreshItems).toBe('function')
    expect(typeof result.setFirstAsActive).toBe('function')
  })

  it('should default activeIndex to -1', () => {
    const containerRef = shallowRef<HTMLElement | undefined>(undefined)
    const { activeIndex } = useListNavigation(containerRef, {
      loop: true,
    })

    expect(activeIndex.value).toBe(-1)
  })

  it('should accept custom defaultActiveIndex', () => {
    const containerRef = shallowRef<HTMLElement | undefined>(undefined)
    const { activeIndex } = useListNavigation(containerRef, {
      loop: true,
      defaultActiveIndex: 2,
    })

    expect(activeIndex.value).toBe(2)
  })

  it('should delegate horizontal navigation to hierarchy handlers', async () => {
    const container = document.createElement('ul')
    const item = document.createElement('li')
    item.dataset.listItem = ''
    container.append(item)
    document.body.append(container)

    const onLeft = vi.fn()
    const onRight = vi.fn()
    const { onKeydown, refreshItems, setActiveIndex } = useListNavigation(shallowRef(container), {
      onLeft,
      onRight,
    })

    await refreshItems()
    setActiveIndex(0)

    const rightEvent = new KeyboardEvent('keydown', { key: 'ArrowRight', cancelable: true })
    onKeydown(rightEvent)

    expect(onRight).toHaveBeenCalledWith(item)
    expect(rightEvent.defaultPrevented).toBe(true)

    const leftEvent = new KeyboardEvent('keydown', { key: 'ArrowLeft', cancelable: true })
    onKeydown(leftEvent)

    expect(onLeft).toHaveBeenCalledOnce()
    expect(leftEvent.defaultPrevented).toBe(true)

    container.remove()
  })

  it('should filter nested list items from the current level', async () => {
    const container = document.createElement('ul')
    container.dataset.listContainer = ''
    const item = document.createElement('li')
    item.dataset.listItem = ''
    const nestedContainer = document.createElement('ul')
    nestedContainer.dataset.listContainer = ''
    const nestedItem = document.createElement('li')
    nestedItem.dataset.listItem = ''
    nestedContainer.append(nestedItem)
    item.append(nestedContainer)
    container.append(item)
    document.body.append(container)

    const { activeIndex, refreshItems, setActiveIndex } = useListNavigation(shallowRef(container), {
      itemFilter: (el, currentContainer) =>
        el.closest<HTMLElement>('[data-list-container]') === currentContainer,
    })

    await refreshItems()
    setActiveIndex(1)
    await refreshItems()

    expect(activeIndex.value).toBe(0)

    container.remove()
  })
})
