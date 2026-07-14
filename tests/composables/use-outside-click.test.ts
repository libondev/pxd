import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { useOutsideClick } from '../../src/composables/use-outside-click'
import { useSetupWrapper } from '../helpers/setup'

describe('useOutsideClick', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return stop function', () => {
    const container = document.createElement('div')
    const { stop, unmount } = useSetupWrapper(() => useOutsideClick(() => container))

    expect(typeof stop).toBe('function')
    unmount()
  })

  it('should support custom event and listener options', () => {
    const container = document.createElement('div')
    const onTrigger = vi.fn()
    const { unmount } = useSetupWrapper(() =>
      useOutsideClick(() => container, {
        eventName: 'pointerdown',
        listenerOptions: { capture: true },
        onTrigger,
      }),
    )

    document.body.dispatchEvent(new Event('pointerdown', { bubbles: true }))

    expect(onTrigger).toHaveBeenCalledTimes(1)
    unmount()
  })
})
