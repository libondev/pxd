import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useScrollspy } from '../../src/composables/use-scrollspy'
import { useSetupWrapper } from '../helpers/setup'

describe('useScrollspy', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return expected API', () => {
    const { activeIndex, activeEl, update, unmount } = useSetupWrapper(() => useScrollspy([]))

    expect(activeIndex).toBeDefined()
    expect(activeEl).toBeDefined()
    expect(typeof update).toBe('function')
    unmount()
  })

  it('should default activeIndex to -1', () => {
    const { activeIndex, unmount } = useSetupWrapper(() => useScrollspy([]))

    expect(activeIndex.value).toBe(-1)
    unmount()
  })

  it('should default activeEl to null', () => {
    const { activeEl, unmount } = useSetupWrapper(() => useScrollspy([]))

    expect(activeEl.value).toBeNull()
    unmount()
  })
})
