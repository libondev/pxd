import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
import { useOverlayManager } from '../../src/composables/_internal/use-overlay-manager'
import { useSetupWrapper } from '../helpers/setup'

describe('useOverlayManager', () => {
  afterEach(() => {
    document.documentElement.classList.remove('pointer-events-none')
  })

  function createManager(options: Omit<Parameters<typeof useOverlayManager>[0], 'visible'>) {
    const visible = ref(false)
    const { unmount } = useSetupWrapper(() => useOverlayManager({ ...options, visible }))

    return {
      visible,
      unmount,
      async show() {
        visible.value = true
        await nextTick()
      },
      async hide() {
        visible.value = false
        await nextTick()
      },
    }
  }

  it('should join the stack while visible and leave it when hidden', async () => {
    const onPressEscape = vi.fn(() => true)
    const { show, hide, unmount } = createManager({ onPressEscape, lockScrollOnVisible: true })

    await show()

    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)

    const event = new Event('touchmove', { cancelable: true })
    document.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(true)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onPressEscape).toHaveBeenCalledOnce()

    await hide()

    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)

    const unlockedEvent = new Event('touchmove', { cancelable: true })
    document.dispatchEvent(unlockedEvent)
    expect(unlockedEvent.defaultPrevented).toBe(false)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    expect(onPressEscape).toHaveBeenCalledOnce()

    unmount()
  })

  it('should keep page interaction disabled until every overlay unlocks', async () => {
    const first = createManager({ lockScrollOnVisible: true })
    const second = createManager({ lockScrollOnVisible: true })

    await first.show()
    await second.show()

    await first.hide()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(true)

    await second.hide()
    expect(document.documentElement.classList.contains('pointer-events-none')).toBe(false)

    first.unmount()
    second.unmount()
  })

  function createEscapeManager() {
    const onPressEscape = vi.fn()
    const { unmount } = useSetupWrapper(() =>
      useOverlayManager({
        visible: true,
        onPressEscape,
      }),
    )

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

  function createOverlay(handler: () => boolean | void, zIndex?: number, level?: number) {
    const { unmount } = useSetupWrapper(() =>
      useOverlayManager({
        visible: true,
        onPressEscape: handler,
        zIndex: () => zIndex,
        level: () => level,
      }),
    )

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

  it('should order overlays by z-index before registration order', () => {
    const high = vi.fn(() => true)
    const low = vi.fn(() => true)
    const unmountHigh = createOverlay(high, 20)
    const unmountLow = createOverlay(low, 5)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(high).toHaveBeenCalledOnce()
    expect(low).not.toHaveBeenCalled()

    unmountHigh()
    unmountLow()
  })

  it('should order layers at the same level by registration order', () => {
    const dialog = vi.fn(() => true)
    const nested = vi.fn(() => true)
    const unmountDialog = createOverlay(dialog, 0, 0)
    const unmountNested = createOverlay(nested, 0, 0)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(nested).toHaveBeenCalledOnce()
    expect(dialog).not.toHaveBeenCalled()

    unmountDialog()
    unmountNested()
  })

  it('should let a deeper top-layer level win over a higher z-index', () => {
    const outer = vi.fn(() => true)
    const inner = vi.fn(() => true)
    const unmountOuter = createOverlay(outer, 1000, 0)
    const unmountInner = createOverlay(inner, 0, 0.5)

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

    expect(inner).toHaveBeenCalledOnce()
    expect(outer).not.toHaveBeenCalled()

    unmountOuter()
    unmountInner()
  })
})
