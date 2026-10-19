import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useOverlayManager } from '../../src/composables/_internal/use-overlay-manager'
import { useSetupWrapper } from '../helpers/setup'

describe('useOverlayManager', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    document.documentElement.classList.remove('pointer-events-none')
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

  it('should disable page interaction while the scroll is locked', () => {
    const { registerOverlay, unregisterOverlay, unmount } = useSetupWrapper(() =>
      useOverlayManager({
        enabled: true,
        lockScrollOnVisible: true,
        lockScroll: vi.fn(),
        unlockScroll: vi.fn(),
      }),
    )

    registerOverlay()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)

    const event = new Event('touchmove', { cancelable: true })
    document.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)

    unregisterOverlay()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)

    const unlockedEvent = new Event('touchmove', { cancelable: true })
    document.dispatchEvent(unlockedEvent)
    expect(unlockedEvent.defaultPrevented).toBe(false)

    unmount()
  })

  it('should keep page interaction disabled until every overlay unlocks', () => {
    const createManager = () =>
      useSetupWrapper(() =>
        useOverlayManager({
          enabled: true,
          lockScrollOnVisible: true,
          lockScroll: vi.fn(),
          unlockScroll: vi.fn(),
        }),
      )

    const first = createManager()
    const second = createManager()

    first.registerOverlay()
    second.registerOverlay()

    first.unregisterOverlay()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)

    second.unregisterOverlay()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)

    first.unmount()
    second.unmount()
  })

  function createEscapeManager() {
    const onPressEscape = vi.fn()
    const { registerOverlay, unmount } = useSetupWrapper(() =>
      useOverlayManager({
        enabled: true,
        lockScroll: vi.fn(),
        unlockScroll: vi.fn(),
        onPressEscape,
      }),
    )

    registerOverlay()

    return { onPressEscape, unmount }
  }

  it('should ignore Escape while composing', () => {
    const { onPressEscape, unmount } = createEscapeManager()
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    Object.assign(event, { isComposing: true })

    document.dispatchEvent(event)

    expect(onPressEscape).not.toHaveBeenCalled()

    unmount()
  })

  it('should ignore Escape already handled by a nested component', () => {
    const { onPressEscape, unmount } = createEscapeManager()
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })

    event.preventDefault()
    document.dispatchEvent(event)

    expect(onPressEscape).not.toHaveBeenCalled()

    unmount()
  })

  it('should ignore repeated Escape', () => {
    const { onPressEscape, unmount } = createEscapeManager()
    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })
    Object.assign(event, { repeat: true })

    document.dispatchEvent(event)

    expect(onPressEscape).not.toHaveBeenCalled()

    unmount()
  })

  function createOverlay(handler: () => boolean | void) {
    const { registerOverlay, unmount } = useSetupWrapper(() =>
      useOverlayManager({
        enabled: true,
        lockScroll: vi.fn(),
        unlockScroll: vi.fn(),
        onPressEscape: handler,
      }),
    )

    registerOverlay()

    return unmount
  }

  it('should continue to the next overlay when the top one does not consume Escape', () => {
    const outer = vi.fn(() => true)
    const inner = vi.fn(() => false)
    const unmountOuter = createOverlay(outer)
    const unmountInner = createOverlay(inner)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(inner).toHaveBeenCalledOnce()
    expect(outer).toHaveBeenCalledOnce()

    unmountOuter()
    unmountInner()
  })

  it('should stop at the first overlay that consumes Escape', () => {
    const outer = vi.fn(() => true)
    const inner = vi.fn(() => true)
    const unmountOuter = createOverlay(outer)
    const unmountInner = createOverlay(inner)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(inner).toHaveBeenCalledOnce()
    expect(outer).not.toHaveBeenCalled()

    unmountOuter()
    unmountInner()
  })
})
