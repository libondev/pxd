import { describe, expect, it, vi, beforeEach, afterEach } from 'vite-plus/test'
import { nextTick, ref } from 'vue'
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

  it('should listen only while enabled is true', async () => {
    const container = document.createElement('div')
    const onTrigger = vi.fn()
    const active = ref(false)

    const { unmount } = useSetupWrapper(() =>
      useOutsideClick(() => container, { enabled: active, onTrigger }),
    )

    document.body.dispatchEvent(new Event('click', { bubbles: true }))
    expect(onTrigger).not.toHaveBeenCalled()

    active.value = true
    await nextTick()

    document.body.dispatchEvent(new Event('click', { bubbles: true }))
    expect(onTrigger).toHaveBeenCalledTimes(1)

    active.value = false
    await nextTick()

    document.body.dispatchEvent(new Event('click', { bubbles: true }))
    expect(onTrigger).toHaveBeenCalledTimes(1)

    unmount()
  })
})
