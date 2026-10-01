import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import ResizableHandle from '../../src/components/resizable-handle/index.vue'
import ResizablePanel from '../../src/components/resizable-panel/index.vue'
import Resizable from '../../src/components/resizable/index.vue'
import {
  CONTAINER_SIZE,
  createPointerEvent,
  drag,
  flush,
  readSizes,
  roundSizes,
  total,
} from '../helpers/resizable'

function mountResizable(
  children: () => any[],
  props: Record<string, unknown> = {},
  ref?: { value: any },
) {
  const wrapper = mount(Resizable, { props, slots: { default: children } })

  Object.defineProperty(wrapper.element, 'offsetWidth', {
    value: CONTAINER_SIZE,
    configurable: true,
  })
  Object.defineProperty(wrapper.element, 'offsetHeight', {
    value: CONTAINER_SIZE,
    configurable: true,
  })

  if (ref) {
    ref.value = wrapper.vm
  }

  return wrapper
}

function twoPanels(a: Record<string, unknown>, b: Record<string, unknown>) {
  return () => [
    h(ResizablePanel, a, () => 'A'),
    h(ResizableHandle),
    h(ResizablePanel, b, () => 'B'),
  ]
}

describe('resizable', () => {
  it('renders the default slot', () => {
    const wrapper = mountResizable(() => [h('div', 'content')])

    expect(wrapper.text()).toContain('content')

    wrapper.unmount()
  })

  it('defaults direction to horizontal', () => {
    const wrapper = mountResizable(() => [])

    expect(wrapper.props('direction')).toBe('horizontal')
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')

    wrapper.unmount()
  })

  it('splits the remaining space between auto sized panels', async () => {
    const wrapper = mountResizable(twoPanels({ size: 30 }, {}))
    await flush()

    expect(readSizes(wrapper)).toEqual([30, 70])

    wrapper.unmount()
  })

  it('gives an auto sized panel its min-size before it shares the rest', async () => {
    const wrapper = mountResizable(twoPanels({ size: 60 }, { minSize: 25 }))
    await flush()

    // 40 left over: 25 goes to the min-size, the remaining 15 is its share.
    expect(readSizes(wrapper)).toEqual([60, 40])

    wrapper.unmount()
  })

  it('scales min-sizes down when they do not fit next to fixed sizes', async () => {
    const wrapper = mountResizable(twoPanels({ size: 90 }, { minSize: 25 }))
    await flush()

    // Only 10 is left, so the min-size is scaled to keep the group at 100%.
    expect(readSizes(wrapper)).toEqual([90, 10])
    expect(total(readSizes(wrapper))).toBe(100)

    wrapper.unmount()
  })

  it('normalises over constrained sizes instead of overflowing', async () => {
    const wrapper = mountResizable(twoPanels({ size: 60 }, { size: 60 }))
    await flush()

    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(total(readSizes(wrapper))).toBe(100)

    wrapper.unmount()
  })

  it('warns when the configured sizes do not fit', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountResizable(twoPanels({ size: 60 }, { size: 60 }))
    await flush()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('add up to 120%'))

    wrapper.unmount()
    warn.mockRestore()
  })

  it('warns when v-model does not match the panel count', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const Host = defineComponent({
      setup: () => () => h(Resizable, { modelValue: [50] }, twoPanels({}, {})),
    })

    const wrapper = mount(Host)
    await flush()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('1 size but the group has 2 panels'))

    wrapper.unmount()
    warn.mockRestore()
  })

  it('keeps dragged sizes when a panel is mounted later', async () => {
    const extra = ref(false)

    const wrapper = mountResizable(() =>
      [
        h(ResizablePanel, { size: 50 }, () => 'A'),
        h(ResizableHandle),
        h(ResizablePanel, { size: 50 }, () => 'B'),
        extra.value ? h(ResizableHandle) : null,
        extra.value ? h(ResizablePanel, { size: 20 }, () => 'C') : null,
      ].filter(Boolean),
    )
    await flush()

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 650)
    await flush()

    expect(readSizes(wrapper)).toEqual([65, 35])

    extra.value = true
    await flush()

    // C takes its configured 20%, A and B keep their ratio inside the other 80.
    expect(readSizes(wrapper)).toEqual([52, 28, 20])
    expect(total(roundSizes(readSizes(wrapper)))).toBeCloseTo(100, 1)

    wrapper.unmount()
  })

  it('gives a removed panel share back to the ones that stay', async () => {
    const extra = ref(true)

    const wrapper = mountResizable(() =>
      [
        h(ResizablePanel, { size: 30 }, () => 'A'),
        h(ResizableHandle),
        h(ResizablePanel, { size: 30 }, () => 'B'),
        extra.value ? h(ResizableHandle) : null,
        extra.value ? h(ResizablePanel, { size: 40 }, () => 'C') : null,
      ].filter(Boolean),
    )
    await flush()

    drag(wrapper.findAll('.pxd-resizable-handle')[0]!.element, 500, 600)
    await flush()

    expect(readSizes(wrapper)).toEqual([40, 20, 40])

    extra.value = false
    await flush()

    expect(roundSizes(readSizes(wrapper))).toEqual([66.67, 33.33])
    expect(total(roundSizes(readSizes(wrapper)))).toBeCloseTo(100, 1)

    wrapper.unmount()
  })

  it('keeps dragged sizes when a panel size prop changes', async () => {
    const sizeA = ref(30)

    const wrapper = mountResizable(() => [
      h(ResizablePanel, { size: sizeA.value }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 70 }, () => 'B'),
    ])
    await flush()

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 550)
    await flush()

    expect(readSizes(wrapper)).toEqual([35, 65])

    sizeA.value = 31
    await flush()

    expect(readSizes(wrapper)).toEqual([35, 65])

    wrapper.unmount()
  })

  it('follows modelValue when controlled', async () => {
    const model = ref([20, 80])

    const Host = defineComponent({
      setup: () => () => h(Resizable, { modelValue: model.value }, twoPanels({}, {})),
    })

    const wrapper = mount(Host)
    await flush()

    expect(roundSizes(readSizes(wrapper))).toEqual([20, 80])

    model.value = [45, 55]
    await flush()

    expect(readSizes(wrapper)).toEqual([45, 55])

    wrapper.unmount()
  })

  it('emits update:modelValue on drag and change once on pointerup', async () => {
    const wrapper = mountResizable(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle').element

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 650 }))

    expect(wrapper.emitted('change')).toBeUndefined()

    handle.dispatchEvent(createPointerEvent('pointerup', { x: 650 }))
    await flush()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[65, 35]])
    expect(wrapper.emitted('change')).toEqual([[[65, 35]]])
    expect(wrapper.emitted('change')).toHaveLength(1)

    wrapper.unmount()
  })

  it('does not emit change when a drag ends without moving', async () => {
    const wrapper = mountResizable(twoPanels({ size: 50 }, { size: 50 }))
    await flush()

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 500)
    await flush()

    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('collapses the previous panel on double click and expands it again', async () => {
    const wrapper = mountResizable(() => [
      h(ResizablePanel, { size: 30, minSize: 10 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 40 }, () => 'B'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 30 }, () => 'C'),
    ])
    await flush()

    const handles = wrapper.findAll('.pxd-resizable-handle')

    drag(handles[0]!.element, 500, 550)
    await flush()

    expect(readSizes(wrapper)).toEqual([35, 35, 30])

    handles[1]!.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    // B folds down to its min-size and hands the rest to C.
    expect(readSizes(wrapper)).toEqual([35, 0, 65])
    expect(handles[1]!.attributes('aria-expanded')).toBe('false')
    expect(handles[1]!.attributes('data-collapsed')).toBe('true')
    expect(handles[0]!.attributes('aria-expanded')).toBe('true')

    handles[1]!.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    // Expanding gives back the 35 the user dragged B to, not its configured 40.
    expect(readSizes(wrapper)).toEqual([35, 35, 30])
    expect(handles[1]!.attributes('aria-expanded')).toBe('true')
    expect(handles[1]!.attributes('data-collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('expands a collapsed pair when it is dragged', async () => {
    const wrapper = mountResizable(twoPanels({ size: 40 }, { size: 60 }))
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    drag(handle.element, 500, 600)
    await flush()

    expect(readSizes(wrapper)).toEqual([10, 90])
    expect(handle.attributes('aria-expanded')).toBe('true')

    wrapper.unmount()
  })

  it('reset restores the configured sizes and expands collapsed pairs', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(twoPanels({ size: 40 }, { size: 60 }), {}, exposed)
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    drag(handle.element, 500, 650)
    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    exposed.value.reset()
    await flush()

    expect(readSizes(wrapper)).toEqual([40, 60])
    expect(handle.attributes('aria-expanded')).toBe('true')
    expect(wrapper.emitted('reset')).toEqual([[[40, 60]]])

    wrapper.unmount()
  })

  it('does nothing when an inert handle is double clicked', async () => {
    const wrapper = mountResizable(() => [
      h(ResizableHandle),
      h(ResizablePanel, { size: 30 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 70 }, () => 'B'),
    ])
    await flush()

    const handles = wrapper.findAll('.pxd-resizable-handle')

    handles[0]!.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([30, 70])

    wrapper.unmount()
  })

  it('marks a handle without panels on both sides as inert', async () => {
    const wrapper = mountResizable(() => [
      h(ResizableHandle),
      h(ResizablePanel, { size: 30 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 70 }, () => 'B'),
    ])
    await flush()

    const handles = wrapper.findAll('.pxd-resizable-handle')

    expect(handles[0]!.attributes('aria-disabled')).toBe('true')
    expect(handles[1]!.attributes('aria-disabled')).toBeUndefined()

    drag(handles[0]!.element, 500, 650)
    await flush()

    expect(readSizes(wrapper)).toEqual([30, 70])

    wrapper.unmount()
  })

  it('exposes the current sizes and a reset through the template ref', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(twoPanels({ size: 60 }, { size: 40 }), {}, exposed)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([60, 40])

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 600)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([70, 30])

    exposed.value.reset()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([60, 40])
    expect(readSizes(wrapper)).toEqual([60, 40])

    wrapper.unmount()
  })

  it('rounds sizes to two decimals when the split repeats', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      () => [
        h(ResizablePanel, null, () => 'A'),
        h(ResizableHandle),
        h(ResizablePanel, null, () => 'B'),
        h(ResizableHandle),
        h(ResizablePanel, null, () => 'C'),
      ],
      {},
      exposed,
    )
    await flush()

    // 100 / 3 has no finite binary form.
    expect(exposed.value.getPanelSizes()).toEqual([33.33, 33.33, 33.33])
    expect(wrapper.findAll('.pxd-resizable-panel')[0]!.attributes('style')).toContain(
      'flex-basis: 33.33%',
    )

    wrapper.unmount()
  })

  it('never accumulates float noise while dragging', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(twoPanels({ size: 50 }, { size: 50 }), {}, exposed)
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle').element

    // A third of a pixel on a 1000px container is 0.0333...%.
    for (let step = 0; step < 40; step++) {
      drag(handle, 500, 500 + 1 / 3)
      await flush()
    }

    const sizes = exposed.value.getPanelSizes()

    expect(sizes).toEqual([51.2, 48.8])
    expect(sizes.every((size: number) => Number.isInteger(size * 100))).toBe(true)
    expect(total(sizes)).toBeCloseTo(100, 2)
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([51.2, 48.8])

    wrapper.unmount()
  })

  it('never breaks the 100% sum while dragging against min and max bounds', async () => {
    const wrapper = mountResizable(() => [
      h(ResizablePanel, { size: 20, minSize: 15, maxSize: 45 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 30, minSize: 10, maxSize: 50 }, () => 'B'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 50, minSize: 0, maxSize: 100 }, () => 'C'),
    ])
    await flush()

    const handles = wrapper.findAll('.pxd-resizable-handle')

    for (let step = 0; step < 40; step++) {
      const offset = ((step * 37) % 21) - 10
      drag(handles[step % 2]!.element, 500, 500 + offset * 23)
      await flush()

      const sizes = roundSizes(readSizes(wrapper))

      expect(total(sizes)).toBeCloseTo(100, 1)
      expect(sizes.every((size) => size >= 0)).toBe(true)
    }

    wrapper.unmount()
  })
})
