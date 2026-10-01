import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import ResizableHandle from '../../src/components/resizable-handle/index.vue'
import ResizablePanel from '../../src/components/resizable-panel/index.vue'
import Resizable from '../../src/components/resizable/index.vue'
import { CONTAINER_SIZE, createPointerEvent, drag, flush, readSizes } from '../helpers/resizable'

function mountGroup(children: () => any[], direction: 'horizontal' | 'vertical' = 'horizontal') {
  const wrapper = mount(Resizable, {
    props: { direction },
    slots: { default: children },
  })

  Object.defineProperty(wrapper.element, 'offsetWidth', {
    value: CONTAINER_SIZE,
    configurable: true,
  })
  Object.defineProperty(wrapper.element, 'offsetHeight', {
    value: CONTAINER_SIZE,
    configurable: true,
  })

  return wrapper
}

function twoPanels(a: Record<string, unknown>, b: Record<string, unknown>) {
  return () => [
    h(ResizablePanel, a, () => 'A'),
    h(ResizableHandle),
    h(ResizablePanel, b, () => 'B'),
  ]
}

describe('resizable-handle', () => {
  it('renders with data-handler when withHandle is set', () => {
    const wrapper = mountGroup(() => [h(ResizableHandle, { withHandle: true })])

    const handle = wrapper.findComponent(ResizableHandle)

    expect(handle.classes()).toContain('pxd-resizable-handle')
    expect(handle.attributes('data-handler')).toBe('true')

    wrapper.unmount()
  })

  it('should omit data-handler when withHandle is not set', () => {
    const wrapper = mountGroup(() => [h(ResizableHandle)])

    expect(wrapper.findComponent(ResizableHandle).attributes('data-handler')).toBe('false')

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mountGroup(() => [h(ResizableHandle, { 'data-test': 'handle' })])

    expect(wrapper.findComponent(ResizableHandle).attributes('data-test')).toBe('handle')

    wrapper.unmount()
  })

  it('exposes separator semantics to assistive tech', async () => {
    const wrapper = mountGroup(twoPanels({ size: 30, minSize: 10, maxSize: 60 }, { minSize: 20 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    expect(handle.attributes('role')).toBe('separator')
    expect(handle.attributes('tabindex')).toBe('0')
    expect(handle.attributes('aria-orientation')).toBe('horizontal')
    expect(handle.attributes('aria-valuenow')).toBe('30')
    expect(handle.attributes('aria-valuemin')).toBe('10')
    expect(handle.attributes('aria-valuemax')).toBe('60')
    expect(handle.attributes('aria-disabled')).toBeUndefined()

    wrapper.unmount()
  })

  it('reports the vertical orientation', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }), 'vertical')
    await flush()

    expect(wrapper.find('.pxd-resizable-handle').attributes('aria-orientation')).toBe('vertical')

    wrapper.unmount()
  })

  it('carries its own orientation so nesting does not inherit the outer one', async () => {
    const wrapper = mountGroup(
      () => [
        h(ResizablePanel, { size: 50 }, () => 'A'),
        h(ResizableHandle),
        h(ResizablePanel, { size: 50 }, () => [
          h(Resizable, { direction: 'horizontal' }, () => [
            h(ResizablePanel, { size: 50 }, () => 'B'),
            h(ResizableHandle),
            h(ResizablePanel, { size: 50 }, () => 'C'),
          ]),
        ]),
      ],
      'vertical',
    )
    await flush()

    const handles = wrapper.findAll('.pxd-resizable-handle')

    expect(handles).toHaveLength(2)
    expect(handles[0]!.attributes('data-orientation')).toBe('vertical')
    expect(handles[1]!.attributes('data-orientation')).toBe('horizontal')

    wrapper.unmount()
  })

  it('tracks the panel size it controls', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    drag(handle.element, 500, 600)
    await flush()

    expect(handle.attributes('aria-valuenow')).toBe('60')

    wrapper.unmount()
  })

  it('resizes with the arrow keys', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    await handle.trigger('keydown', { key: 'ArrowRight' })
    await flush()

    expect(readSizes(wrapper)).toEqual([51, 49])

    await handle.trigger('keydown', { key: 'ArrowLeft' })
    await handle.trigger('keydown', { key: 'ArrowLeft' })
    await flush()

    expect(readSizes(wrapper)).toEqual([49, 51])
    expect(wrapper.emitted('change')).toHaveLength(3)

    wrapper.unmount()
  })

  it('resizes by ten with shift held', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    await wrapper.find('.pxd-resizable-handle').trigger('keydown', {
      key: 'ArrowRight',
      shiftKey: true,
    })
    await flush()

    expect(readSizes(wrapper)).toEqual([60, 40])

    wrapper.unmount()
  })

  it('jumps to the bounds with Home and End', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50, minSize: 20 }, { minSize: 10 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    await handle.trigger('keydown', { key: 'Home' })
    await flush()

    expect(readSizes(wrapper)).toEqual([20, 80])

    await handle.trigger('keydown', { key: 'End' })
    await flush()

    // The neighbour's min-size still wins over this panel's max-size.
    expect(readSizes(wrapper)).toEqual([90, 10])

    wrapper.unmount()
  })

  it('resizes on the vertical axis for a vertical group', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }), 'vertical')
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('pointerdown', { y: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointermove', { y: 600 }))
    handle.element.dispatchEvent(createPointerEvent('pointerup', { y: 600 }))
    await flush()

    expect(readSizes(wrapper)).toEqual([60, 40])

    wrapper.unmount()
  })

  it('ignores a horizontal move in a vertical group', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }), 'vertical')
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('pointerdown', { y: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 900, y: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointerup', { y: 500 }))
    await flush()

    expect(readSizes(wrapper)).toEqual([50, 50])

    wrapper.unmount()
  })

  it('stops dragging once the pointer is released', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    drag(handle.element, 500, 600)
    await flush()

    // No button is down any more: moving the pointer must not resize anything.
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 800 }))
    await flush()

    expect(readSizes(wrapper)).toEqual([60, 40])

    wrapper.unmount()
  })

  it('does not resize when the drag is cancelled', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 650 }))
    handle.element.dispatchEvent(createPointerEvent('pointercancel', { x: 650 }))
    await flush()

    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 800 }))
    await flush()

    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('releases the drag when the pointer capture is lost', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.element.dispatchEvent(createPointerEvent('lostpointercapture'))
    await flush()

    // Losing the capture ends the drag, so a stray move cannot resize anything.
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 800 }))
    await flush()

    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('commits the pending resize when the drag ends', async () => {
    const wrapper = mountGroup(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle').element

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 650 }))
    handle.dispatchEvent(createPointerEvent('pointerup', { x: 650 }))
    await flush()

    expect(wrapper.emitted('change')).toEqual([[[65, 35]]])

    wrapper.unmount()
  })
})
