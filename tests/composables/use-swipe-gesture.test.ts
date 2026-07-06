import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { useSwipeGesture } from '../../src/composables/use-swipe-gesture'

describe('useSwipeGesture', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  function mountGesture(options: Parameters<typeof useSwipeGesture>[1]) {
    const component = defineComponent({
      setup() {
        const el = shallowRef<HTMLElement>()
        useSwipeGesture(el, options)
        return () => h('div', { ref: el })
      },
    })

    return mount(component, { attachTo: document.body })
  }

  function setSize(el: HTMLElement, size: number) {
    Object.defineProperty(el, 'offsetWidth', { configurable: true, value: size })
    Object.defineProperty(el, 'offsetHeight', { configurable: true, value: size })
  }

  function pointer(type: string, x: number, y = 0) {
    const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent
    Object.defineProperties(event, {
      button: { value: 0 },
      clientX: { value: x },
      clientY: { value: y },
      isPrimary: { value: true },
      pointerId: { value: 1 },
      pointerType: { value: 'touch' },
    })
    return event
  }

  it('should export useSwipeGesture as a function', () => {
    expect(typeof useSwipeGesture).toBe('function')
  })

  it('should emit signed movement state for pointer drag', async () => {
    vi.useFakeTimers()

    const onFollow = vi.fn()
    const wrapper = mountGesture({ swipeThreshold: 0, onFollow })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointermove', 50))

    vi.setSystemTime(200)
    window.dispatchEvent(pointer('pointermove', 20))

    expect(onFollow).toHaveBeenNthCalledWith(1, {
      displacement: 50,
      delta: 50,
      velocity: 0.5,
      offset: 0.5,
    })
    expect(onFollow).toHaveBeenNthCalledWith(2, {
      displacement: 20,
      delta: -30,
      velocity: -0.3,
      offset: 0.2,
    })

    wrapper.unmount()
  })

  it('should resolve quick swipe direction from signed velocity', async () => {
    vi.useFakeTimers()

    const onRelease = vi.fn()
    const wrapper = mountGesture({ swipeThreshold: 0, velocityThreshold: 0.3, onRelease })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 1000)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 100))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointerup', 50))

    expect(onRelease).toHaveBeenCalledWith({ swiped: true, direction: 'left' })

    wrapper.unmount()
  })

  it('should keep following after the target axis is locked', async () => {
    vi.useFakeTimers()

    const onFollow = vi.fn()
    const wrapper = mountGesture({ swipeThreshold: 0, onFollow })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0, 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointermove', 20, 5))

    vi.setSystemTime(200)
    window.dispatchEvent(pointer('pointermove', 25, 80))

    expect(onFollow).toHaveBeenCalledTimes(2)
    expect(onFollow).toHaveBeenLastCalledWith({
      displacement: 25,
      delta: 5,
      velocity: 0.05,
      offset: 0.25,
    })

    wrapper.unmount()
  })

  it('should reject gestures locked to the cross axis', async () => {
    vi.useFakeTimers()

    const onFollow = vi.fn()
    const onRelease = vi.fn()
    const wrapper = mountGesture({ swipeThreshold: 0, onFollow, onRelease })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0, 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointermove', 5, 20))

    vi.setSystemTime(200)
    window.dispatchEvent(pointer('pointerup', 10, 40))

    expect(onFollow).not.toHaveBeenCalled()
    expect(onRelease).toHaveBeenCalledWith({ swiped: false })

    wrapper.unmount()
  })

  it('should set touch action for the non-target axis', async () => {
    const horizontalWrapper = mountGesture({})
    await nextTick()
    await nextTick()

    expect((horizontalWrapper.element as HTMLElement).style.touchAction).toBe('pan-y')
    horizontalWrapper.unmount()

    const verticalWrapper = mountGesture({ axis: 'vertical' })
    await nextTick()
    await nextTick()

    expect((verticalWrapper.element as HTMLElement).style.touchAction).toBe('pan-x')
    verticalWrapper.unmount()
  })

  it('should restore touch action after unmount', async () => {
    const wrapper = mountGesture({})
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    el.style.touchAction = 'pan-y'

    wrapper.unmount()

    expect(el.style.touchAction).toBe('')
  })

  it('should not bind gesture handlers while disabled', async () => {
    vi.useFakeTimers()

    const onFollow = vi.fn()
    const wrapper = mountGesture({ disabled: true, swipeThreshold: 0, onFollow })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointermove', 50))

    expect(onFollow).not.toHaveBeenCalled()

    wrapper.unmount()
  })
})
