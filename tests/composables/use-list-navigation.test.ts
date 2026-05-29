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
})
