import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, nextTick, ref, shallowRef } from 'vue'
import { useSwipeDismiss } from '../../src/composables/_internal/use-swipe-dismiss'
import { pointerEvent, setElementSize } from '../helpers/pointer'

type SwipeDismissOptions = Parameters<typeof useSwipeDismiss>[1]

function mountDismiss(options: Partial<SwipeDismissOptions> = {}) {
  const onDismiss = vi.fn((_event: PointerEvent): boolean | void => true)
  const visible = ref(true)
  let result!: ReturnType<typeof useSwipeDismiss>
  let renders = 0

  const component = defineComponent({
    setup() {
      const el = shallowRef<HTMLElement>()

      result = useSwipeDismiss(el, {
        position: 'bottom',
        visible,
        ...options,
        onDismiss: options.onDismiss ?? onDismiss,
      })

      return () => {
        renders++

        return h('div', { ref: el }, [h('div', { 'data-swipe-handle': '' })])
      }
    },
  })

  const wrapper = mount(component, { attachTo: document.body })

  return {
    wrapper,
    onDismiss,
    visible,
    result,
    get renders() {
      return renders
    },
  }
}

function getHandle(wrapper: ReturnType<typeof mountDismiss>['wrapper']) {
  return (wrapper.element as HTMLElement).querySelector<HTMLElement>('[data-swipe-handle]')!
}

function readOffset(element: HTMLElement) {
  return Number.parseFloat(element.style.getPropertyValue('--swipe-offset') || '0')
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

describe('useSwipeDismiss', () => {
  it('should write tracking movement directly and dismiss past the thresholds', async () => {
    vi.useFakeTimers()

    const { wrapper, onDismiss, result, renders } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 30 }))
    await nextTick()

    const rendersAfterPress = renders
    const panel = wrapper.element as HTMLElement

    expect(readOffset(panel)).toBe(30)
    expect(result.dragging.value).toBe(true)

    vi.setSystemTime(150)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    expect(readOffset(panel)).toBe(60)
    expect(renders).toBe(rendersAfterPress)

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 60 }))
    await nextTick()

    expect(onDismiss).toHaveBeenCalledTimes(1)
    expect(readOffset(panel)).toBe(60)

    wrapper.unmount()
  })

  it('should resist movement away from the open edge', async () => {
    vi.useFakeTimers()

    const { wrapper, onDismiss } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: -60 }))

    expect(readOffset(wrapper.element as HTMLElement)).toBe(-12)

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: -60 }))
    await nextTick()

    expect(onDismiss).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should resist movement beyond the fully dismissed edge', async () => {
    vi.useFakeTimers()

    const { wrapper } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 260 }))

    expect(readOffset(wrapper.element as HTMLElement)).toBe(212)

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 260 }))

    wrapper.unmount()
  })

  it('should dismiss on a slow drag that reaches the distance threshold', async () => {
    vi.useFakeTimers()

    const { wrapper, onDismiss } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(1000)
    window.dispatchEvent(pointerEvent('pointermove', { y: 80 }))

    vi.setSystemTime(2000)
    window.dispatchEvent(pointerEvent('pointerup', { y: 80 }))
    await nextTick()

    expect(onDismiss).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('should ignore release velocity after the pointer has been held still', async () => {
    vi.useFakeTimers()

    const { wrapper, onDismiss } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 1000)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(500)
    window.dispatchEvent(pointerEvent('pointerup', { y: 60 }))
    await nextTick()

    expect(onDismiss).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should not dismiss when the final flick reverses direction', async () => {
    vi.useFakeTimers()

    const { wrapper, onDismiss } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(110)
    window.dispatchEvent(pointerEvent('pointermove', { y: 40 }))

    vi.setSystemTime(120)
    window.dispatchEvent(pointerEvent('pointerup', { y: 40 }))
    await nextTick()

    expect(onDismiss).not.toHaveBeenCalled()

    wrapper.unmount()
  })

  it('should not dismiss on a rejected cross-axis release', async () => {
    vi.useFakeTimers()

    const onDismiss = vi.fn(() => false)
    const { wrapper } = mountDismiss({ onDismiss })

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(1000)
    window.dispatchEvent(pointerEvent('pointermove', { y: 90 }))

    vi.setSystemTime(2000)
    window.dispatchEvent(pointerEvent('pointerup', { y: 90 }))
    await nextTick()

    expect(onDismiss).toHaveBeenCalledTimes(1)

    vi.setSystemTime(2000)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(2100)
    window.dispatchEvent(pointerEvent('pointermove', { x: 100, y: 91 }))

    vi.setSystemTime(2200)
    window.dispatchEvent(pointerEvent('pointerup', { x: 100, y: 91 }))
    await nextTick()

    expect(onDismiss).toHaveBeenCalledTimes(1)

    wrapper.unmount()
  })

  it('should catch the open edge instead of bouncing past it', async () => {
    vi.useFakeTimers()

    const { wrapper } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 300)

    const panel = wrapper.element as HTMLElement
    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(1000)
    window.dispatchEvent(pointerEvent('pointermove', { y: 100 }))

    vi.setSystemTime(1100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 80 }))

    vi.setSystemTime(1150)
    window.dispatchEvent(pointerEvent('pointerup', { y: 80 }))
    await nextTick()

    let lowest = Number.POSITIVE_INFINITY

    for (let i = 0; i < 60; i++) {
      vi.advanceTimersByTime(16)
      lowest = Math.min(lowest, readOffset(panel))
    }

    expect(lowest).toBeGreaterThanOrEqual(0)

    wrapper.unmount()
  })

  it('should settle back when travel and velocity stay below the thresholds', async () => {
    vi.useFakeTimers()

    const { wrapper, onDismiss, result } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(1000)
    window.dispatchEvent(pointerEvent('pointermove', { y: 30 }))

    vi.setSystemTime(2000)
    window.dispatchEvent(pointerEvent('pointerup', { y: 30 }))
    await nextTick()

    expect(onDismiss).not.toHaveBeenCalled()
    expect(result.settling.value).toBe(true)

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(result.settling.value).toBe(false)
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should settle back when the dismiss is refused', async () => {
    vi.useFakeTimers()

    const { wrapper, result } = mountDismiss({ onDismiss: () => false })

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 60 }))
    await nextTick()

    expect(result.settling.value).toBe(true)
    expect(readOffset(wrapper.element as HTMLElement)).toBe(60)

    vi.advanceTimersByTime(1000)
    await nextTick()

    expect(result.settling.value).toBe(false)
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should interrupt snap-back when the sheet is caught again', async () => {
    vi.useFakeTimers()

    const { wrapper, result } = mountDismiss({ onDismiss: () => false })

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const panel = wrapper.element as HTMLElement
    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 60 }))
    await nextTick()
    vi.advanceTimersByTime(100)

    const caughtOffset = readOffset(panel)

    expect(caughtOffset).toBeLessThan(60)

    vi.setSystemTime(300)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    const offsetAtPress = readOffset(panel)

    vi.advanceTimersByTime(100)

    expect(readOffset(panel)).toBe(offsetAtPress)

    vi.setSystemTime(400)
    window.dispatchEvent(pointerEvent('pointermove', { y: 20 }))

    expect(result.dragging.value).toBe(true)
    expect(result.settling.value).toBe(false)
    expect(readOffset(panel)).toBeCloseTo(caughtOffset + 20)

    vi.setSystemTime(500)
    window.dispatchEvent(pointerEvent('pointerup', { y: 20 }))

    wrapper.unmount()
  })

  it('should resume snap-back when a catch releases without dragging', async () => {
    vi.useFakeTimers()

    const { wrapper, result } = mountDismiss({ onDismiss: () => false })

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const panel = wrapper.element as HTMLElement
    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 60 }))
    await nextTick()
    vi.advanceTimersByTime(100)

    const caughtOffset = readOffset(panel)

    vi.setSystemTime(300)
    handle.dispatchEvent(pointerEvent('pointerdown'))
    vi.advanceTimersByTime(100)

    expect(readOffset(panel)).toBe(caughtOffset)

    vi.setSystemTime(400)
    window.dispatchEvent(pointerEvent('pointerup', { y: 0 }))
    await nextTick()

    expect(result.settling.value).toBe(true)

    wrapper.unmount()
  })

  it('should stay at the open edge when released there with an inward velocity', async () => {
    vi.useFakeTimers()

    const { wrapper, result } = mountDismiss()

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const panel = wrapper.element as HTMLElement
    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(110)
    window.dispatchEvent(pointerEvent('pointermove', { y: 0 }))

    vi.setSystemTime(120)
    window.dispatchEvent(pointerEvent('pointerup', { y: 0 }))
    await nextTick()

    expect(result.settling.value).toBe(false)
    expect(panel.style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should skip release motion when reduced motion is requested', async () => {
    vi.useFakeTimers()

    const { wrapper, result } = mountDismiss({ onDismiss: () => false, motionReduced: true })

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 60 }))
    await nextTick()

    expect(result.settling.value).toBe(false)
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should not follow when disabled', async () => {
    vi.useFakeTimers()

    const { wrapper, onDismiss, result } = mountDismiss({ enabled: false })

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: 60 }))

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: 60 }))
    await nextTick()

    expect(onDismiss).not.toHaveBeenCalled()
    expect(result.dragging.value).toBe(false)
    expect((wrapper.element as HTMLElement).style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should reset the offset when it becomes visible again', async () => {
    const { wrapper, visible } = mountDismiss()

    await nextTick()

    const panel = wrapper.element as HTMLElement

    panel.style.setProperty('--swipe-offset', '42px')

    visible.value = false
    await nextTick()

    visible.value = true
    await nextTick()

    expect(panel.style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should reset when the open edge changes', async () => {
    const position = ref<'top' | 'bottom'>('bottom')
    const { wrapper } = mountDismiss({ position })

    await nextTick()

    const panel = wrapper.element as HTMLElement

    panel.style.setProperty('--swipe-offset', '42px')
    position.value = 'top'
    await nextTick()

    expect(panel.style.getPropertyValue('--swipe-offset')).toBe('')

    wrapper.unmount()
  })

  it('should move a top sheet in the opposite direction', async () => {
    vi.useFakeTimers()

    const { wrapper } = mountDismiss({ position: 'top' })

    await nextTick()
    await nextTick()
    setElementSize(wrapper.element, 200)

    const handle = getHandle(wrapper)

    vi.setSystemTime(0)
    handle.dispatchEvent(pointerEvent('pointerdown'))

    vi.setSystemTime(100)
    window.dispatchEvent(pointerEvent('pointermove', { y: -60 }))

    expect(readOffset(wrapper.element as HTMLElement)).toBe(-60)

    vi.setSystemTime(200)
    window.dispatchEvent(pointerEvent('pointerup', { y: -60 }))

    wrapper.unmount()
  })
})
