import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, shallowRef } from 'vue'
import { useSwipeGesture } from '../../src/composables/_internal/use-swipe-gesture'

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

    expect(onFollow).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        displacement: 50,
        delta: 50,
        velocity: 0.5,
        offset: 0.5,
      }),
    )
    expect(onFollow).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        displacement: 20,
        delta: -30,
        velocity: -0.3,
        offset: 0.2,
      }),
    )

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

    expect(onRelease).toHaveBeenCalledWith(
      expect.objectContaining({ swiped: true, direction: 'left' }),
    )

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
    expect(onFollow).toHaveBeenLastCalledWith(
      expect.objectContaining({
        displacement: 25,
        delta: 5,
        velocity: 0.05,
        offset: 0.25,
      }),
    )

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
    expect(onRelease).toHaveBeenCalledWith(
      expect.objectContaining({ swiped: false, axisLocked: false }),
    )

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
  it('should discard the gesture when beforeStart returns false', async () => {
    vi.useFakeTimers()

    const onPress = vi.fn()
    const onFollow = vi.fn()
    const onRelease = vi.fn()
    const onTap = vi.fn()
    const wrapper = mountGesture({
      swipeThreshold: 0,
      beforeStart: () => false,
      onPress,
      onFollow,
      onRelease,
      onTap,
    })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointermove', 50))

    vi.setSystemTime(200)
    window.dispatchEvent(pointer('pointerup', 50))

    expect(onPress).not.toHaveBeenCalled()
    expect(onFollow).not.toHaveBeenCalled()
    expect(onRelease).not.toHaveBeenCalled()
    expect(onTap).toHaveBeenCalledWith(expect.objectContaining({ vetoed: true }))

    wrapper.unmount()
  })

  it('should report a tap when the pointer never travelled far enough', async () => {
    vi.useFakeTimers()

    const onRelease = vi.fn()
    const onTap = vi.fn()
    const wrapper = mountGesture({ onRelease, onTap })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointerup', 0))

    expect(onRelease).not.toHaveBeenCalled()
    expect(onTap).toHaveBeenCalledWith(expect.objectContaining({ vetoed: false }))

    wrapper.unmount()
  })

  it('should carry the pointerdown event on the tap for hit testing', async () => {
    vi.useFakeTimers()

    const onTap = vi.fn()
    const wrapper = mountGesture({ onTap })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    const down = pointer('pointerdown', 0)
    el.dispatchEvent(down)
    window.dispatchEvent(pointer('pointerup', 0))

    expect(onTap).toHaveBeenCalledWith(expect.objectContaining({ startEvent: down }))

    wrapper.unmount()
  })

  it('should not report a tap when the gesture locked to the cross axis', async () => {
    vi.useFakeTimers()

    const onTap = vi.fn()
    const onRelease = vi.fn()
    const wrapper = mountGesture({ swipeThreshold: 0, onTap, onRelease })
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

    expect(onTap).not.toHaveBeenCalled()
    expect(onRelease).toHaveBeenCalledWith(
      expect.objectContaining({ swiped: false, axisLocked: false }),
    )

    wrapper.unmount()
  })

  it('should drop movement while an async beforeStart is pending', async () => {
    vi.useFakeTimers()

    let settle: (value: boolean) => void = () => {}
    const gate = new Promise<boolean>((resolve) => {
      settle = resolve
    })

    const onPress = vi.fn()
    const onFollow = vi.fn()
    const wrapper = mountGesture({ swipeThreshold: 0, beforeStart: () => gate, onPress, onFollow })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointermove', 50))

    expect(onPress).not.toHaveBeenCalled()
    expect(onFollow).not.toHaveBeenCalled()

    settle(true)
    await Promise.resolve()
    await Promise.resolve()
    await Promise.resolve()

    expect(onPress).toHaveBeenCalledTimes(1)

    vi.setSystemTime(200)
    window.dispatchEvent(pointer('pointermove', 80))

    expect(onFollow).toHaveBeenCalledTimes(1)
    expect(onFollow).toHaveBeenLastCalledWith(expect.objectContaining({ displacement: 80 }))

    wrapper.unmount()
  })

  it('should expose release metrics so callers can decide on their own scale', async () => {
    vi.useFakeTimers()

    const onRelease = vi.fn()
    const wrapper = mountGesture({
      swipeThreshold: 0,
      distanceThreshold: 9,
      velocityThreshold: 9,
      onRelease,
    })
    await nextTick()
    await nextTick()

    const el = wrapper.element as HTMLElement
    setSize(el, 100)

    vi.setSystemTime(0)
    el.dispatchEvent(pointer('pointerdown', 0))

    vi.setSystemTime(100)
    window.dispatchEvent(pointer('pointerup', 30))

    expect(onRelease).toHaveBeenCalledWith(
      expect.objectContaining({
        swiped: false,
        axisLocked: true,
        displacement: 30,
      }),
    )

    wrapper.unmount()
  })
})
