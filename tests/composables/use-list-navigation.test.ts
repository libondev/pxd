import { describe, expect, it, vi } from 'vite-plus/test'
import { useListNavigation } from '../../src/composables/_internal/use-list-navigation'

describe('useListNavigation', () => {
  it('should return expected API', () => {
    const result = useListNavigation({
      loop: true,
      count: 3,
    })

    expect(result.activeIndex).toBeDefined()
    expect(typeof result.setActiveIndex).toBe('function')
    expect(typeof result.dispatch).toBe('function')
    expect(typeof result.onPointerOver).toBe('function')
    expect(typeof result.setFirstAsActive).toBe('function')
  })

  it('should default activeIndex to -1', () => {
    const { activeIndex } = useListNavigation({
      loop: true,
      count: 3,
    })

    expect(activeIndex.value).toBe(-1)
  })

  it('should accept custom defaultActiveIndex', () => {
    const { activeIndex } = useListNavigation({
      loop: true,
      count: 5,
      defaultActiveIndex: 2,
    })

    expect(activeIndex.value).toBe(2)
  })

  it('should move to next and previous indexes', () => {
    const { activeIndex, dispatch, setFirstAsActive } = useListNavigation({
      count: 3,
      loop: false,
    })

    setFirstAsActive()
    expect(activeIndex.value).toBe(0)
    expect(dispatch('next')).toBe(true)
    expect(activeIndex.value).toBe(1)
    expect(dispatch('previous')).toBe(true)
    expect(activeIndex.value).toBe(0)
  })

  it('should skip disabled indexes', () => {
    const { activeIndex, dispatch, setFirstAsActive } = useListNavigation({
      count: 3,
      loop: false,
      isDisabled: (index) => index === 1,
    })

    setFirstAsActive()
    expect(activeIndex.value).toBe(0)
    expect(dispatch('next')).toBe(true)
    expect(activeIndex.value).toBe(2)
  })

  it('should delegate horizontal navigation to hierarchy handlers', () => {
    const onLeft = vi.fn()
    const onRight = vi.fn()
    const { dispatch, setActiveIndex } = useListNavigation({
      count: 1,
      onLeft,
      onRight,
    })

    setActiveIndex(0)

    expect(dispatch('enter-child')).toBe(true)
    expect(onRight).toHaveBeenCalledWith(0)

    expect(dispatch('leave-parent')).toBe(true)
    expect(onLeft).toHaveBeenCalledOnce()
  })

  it('should report enter-child as unhandled without a child handler', () => {
    const { dispatch, setActiveIndex } = useListNavigation({
      count: 1,
    })

    setActiveIndex(0)

    expect(dispatch('enter-child')).toBe(false)
  })

  it('should activate the current index via callback', () => {
    const onActivateItem = vi.fn()
    const { dispatch, setActiveIndex } = useListNavigation({
      count: 2,
      onActivateItem,
    })

    setActiveIndex(1)
    expect(dispatch('activate')).toBe(true)
    expect(onActivateItem).toHaveBeenCalledWith(1)
  })
})
