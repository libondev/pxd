import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useOverlayManager } from '../../src/composables/_internal/use-overlay-manager'
import { useSetupWrapper } from '../helpers/setup'

describe('useOverlayManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return expected API', () => {
    const lockScroll = vi.fn()
    const unlockScroll = vi.fn()

    const { isTopOverlay, registerOverlay, unregisterOverlay, unmount } = useSetupWrapper(() =>
      useOverlayManager({
        enabled: true,
        lockScroll,
        unlockScroll,
      }),
    )

    expect(typeof isTopOverlay).toBe('function')
    expect(typeof registerOverlay).toBe('function')
    expect(typeof unregisterOverlay).toBe('function')
    unmount()
  })

  it('should be top overlay when only one', () => {
    const lockScroll = vi.fn()
    const unlockScroll = vi.fn()

    const { isTopOverlay, registerOverlay, unmount } = useSetupWrapper(() =>
      useOverlayManager({
        enabled: true,
        lockScroll,
        unlockScroll,
      }),
    )

    registerOverlay()
    expect(isTopOverlay()).toBe(true)
    unmount()
  })
})
