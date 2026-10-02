import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
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

function slots(leading = 'A', trailing = 'B') {
  return { leading: () => leading, trailing: () => trailing }
}

function mountResizable(
  props: Record<string, unknown> = {},
  scoped: Record<string, (...args: any[]) => unknown> = slots(),
  ref?: { value: any },
) {
  const wrapper = mount(Resizable, { props, slots: scoped })

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

describe('resizable', () => {
  it('renders both panel slots', () => {
    const wrapper = mountResizable()

    expect(wrapper.findAll('.pxd-resizable-panel')).toHaveLength(2)
    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')

    wrapper.unmount()
  })

  it('forwards attributes to the container', () => {
    const wrapper = mountResizable({ 'data-test': 'group', class: 'border' })

    expect(wrapper.attributes('data-test')).toBe('group')
    expect(wrapper.classes()).toContain('border')

    wrapper.unmount()
  })

  it('defaults direction to horizontal', () => {
    const wrapper = mountResizable()

    expect(wrapper.props('direction')).toBe('horizontal')
    expect(wrapper.attributes('data-orientation')).toBe('horizontal')
    expect(wrapper.find('.pxd-resizable-handle').attributes('aria-orientation')).toBe('horizontal')

    wrapper.unmount()
  })

  it('splits evenly when uncontrolled', () => {
    const wrapper = mountResizable()

    expect(readSizes(wrapper)).toEqual([50, 50])

    wrapper.unmount()
  })

  it('starts from default-value when uncontrolled', () => {
    const wrapper = mountResizable({ defaultValue: [30, 70] })

    expect(readSizes(wrapper)).toEqual([30, 70])

    wrapper.unmount()
  })

  it('passes each panel size to its slot', () => {
    const wrapper = mountResizable({ defaultValue: [30, 70] }, {
      leading: ({ size }: { size: number }) => `L${size}`,
      trailing: ({ size }: { size: number }) => `T${size}`,
    })

    expect(wrapper.text()).toContain('L30')
    expect(wrapper.text()).toContain('T70')

    wrapper.unmount()
  })

  it('follows model-value when controlled', async () => {
    const model = ref([25, 75])

    const Host = defineComponent({
      setup: () => () => h(Resizable, { modelValue: model.value }, slots()),
    })

    const wrapper = mount(Host)
    await flush()

    expect(readSizes(wrapper)).toEqual([25, 75])

    model.value = [45, 55]
    await flush()

    expect(readSizes(wrapper)).toEqual([45, 55])

    wrapper.unmount()
  })

  it('nests without the outer group restyling the inner handle', async () => {
    const wrapper = mount(Resizable, {
      slots: {
        leading: () => 'outer',
        trailing: () =>
          h(Resizable, { direction: 'vertical' }, { leading: () => 'in', trailing: () => 'out' }),
      },
    })
    await flush()

    const handles = wrapper.findAll('.pxd-resizable-handle')

    expect(handles).toHaveLength(2)
    expect(handles[0]!.attributes('data-orientation')).toBe('horizontal')
    expect(handles[1]!.attributes('data-orientation')).toBe('vertical')

    wrapper.unmount()
  })

  it('resizes along the y axis when vertical', async () => {
    const wrapper = mountResizable({ direction: 'vertical' })
    await flush()

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 650, 'y')
    await flush()

    expect(readSizes(wrapper)).toEqual([65, 35])

    wrapper.unmount()
  })

  it('emits update:modelValue on drag and change once on pointerup', async () => {
    const wrapper = mountResizable()
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle').element

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 650 }))

    expect(wrapper.emitted('change')).toBeUndefined()

    handle.dispatchEvent(createPointerEvent('pointerup', { x: 650 }))
    await flush()

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([[65, 35]])
    expect(wrapper.emitted('change')).toEqual([[[65, 35]]])

    wrapper.unmount()
  })

  it('does not emit change when a drag ends without moving', async () => {
    const wrapper = mountResizable()
    await flush()

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 500)
    await flush()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('stops the leading panel at its min-size', async () => {
    const wrapper = mountResizable({ minSize: [20, 0] })
    await flush()

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 0)
    await flush()

    expect(readSizes(wrapper)).toEqual([20, 80])

    wrapper.unmount()
  })

  it("caps the leading panel at 100 minus the trailing panel's min-size", async () => {
    const wrapper = mountResizable({ minSize: [0, 40] })
    await flush()

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 1000)
    await flush()

    expect(readSizes(wrapper)).toEqual([60, 40])

    wrapper.unmount()
  })

  it('never breaks the 100% sum while dragging against the min-size', async () => {
    const wrapper = mountResizable({ minSize: [15, 10] })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle').element

    for (let step = 0; step < 40; step++) {
      const offset = ((step * 37) % 21) - 10
      drag(handle, 500, 500 + offset * 23)
      await flush()

      const sizes = roundSizes(readSizes(wrapper))

      expect(total(sizes)).toBeCloseTo(100, 1)
      expect(sizes.every((size) => size >= 0)).toBe(true)
    }

    wrapper.unmount()
  })

  it('never accumulates float noise while dragging', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable({ defaultValue: [50, 50] }, slots(), exposed)
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle').element

    // A third of a pixel on a 1000px container is 0.0333...%.
    for (let step = 0; step < 40; step++) {
      drag(handle, 500, 500 + 1 / 3)
      await flush()
    }

    const sizes = exposed.value.getPanelSizes()

    expect(total(sizes)).toBeCloseTo(100, 2)
    expect(sizes.every((size: number) => Number.isInteger(size * 100))).toBe(true)

    wrapper.unmount()
  })

  it('folds the leading panel down to its min-size on double click', async () => {
    const wrapper = mountResizable({ defaultValue: [30, 70], minSize: [10, 0] })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    drag(handle.element, 500, 550)
    await flush()

    expect(readSizes(wrapper)).toEqual([35, 65])

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([10, 90])
    expect(handle.attributes('data-collapsed')).toBe('true')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    // Expanding gives back the 35 the user dragged to, not the configured 30.
    expect(readSizes(wrapper)).toEqual([35, 65])
    expect(handle.attributes('data-collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('folds all the way to zero when no min-size is given', async () => {
    const wrapper = mountResizable({ defaultValue: [40, 60] })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    wrapper.unmount()
  })

  it('expands a folded pair when it is dragged', async () => {
    const wrapper = mountResizable({ defaultValue: [40, 60] })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    drag(handle.element, 500, 600)
    await flush()

    expect(readSizes(wrapper)).toEqual([10, 90])
    expect(handle.attributes('data-collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('reset restores the configured sizes and expands a folded pair', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable({ defaultValue: [40, 60] }, slots(), exposed)
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    drag(handle.element, 500, 650)
    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    exposed.value.reset()
    await flush()

    expect(readSizes(wrapper)).toEqual([40, 60])
    expect(handle.attributes('data-collapsed')).toBeUndefined()
    expect(wrapper.emitted('reset')).toEqual([[[40, 60]]])

    wrapper.unmount()
  })

  it('exposes the current sizes and a reset through the template ref', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable({ defaultValue: [60, 40] }, slots(), exposed)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([60, 40])

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 600)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([70, 30])

    exposed.value.reset()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([60, 40])

    wrapper.unmount()
  })

  it('draws the grip only when handle is set', () => {
    const plain = mountResizable()
    const gripped = mountResizable({ handle: true })

    expect(plain.find('.pxd-resizable-handle').attributes('data-handler')).toBe('false')
    expect(gripped.find('.pxd-resizable-handle').attributes('data-handler')).toBe('true')

    plain.unmount()
    gripped.unmount()
  })

  it('moves the divider with the arrow keys, and by 10% with shift', async () => {
    const wrapper = mountResizable()
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    await handle.trigger('keydown', { key: 'ArrowRight' })

    expect(readSizes(wrapper)).toEqual([51, 49])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([[51, 49]])

    await handle.trigger('keydown', { key: 'ArrowLeft', shiftKey: true })

    expect(readSizes(wrapper)).toEqual([41, 59])

    wrapper.unmount()
  })

  it('snaps the divider to its bounds with Home and End', async () => {
    const wrapper = mountResizable({ minSize: [20, 30] })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    await handle.trigger('keydown', { key: 'Home' })

    expect(readSizes(wrapper)).toEqual([20, 80])

    await handle.trigger('keydown', { key: 'End' })

    expect(readSizes(wrapper)).toEqual([70, 30])

    wrapper.unmount()
  })

  it('resizes with the y arrows only when the group is vertical', async () => {
    const wrapper = mountResizable({ direction: 'vertical' })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    await handle.trigger('keydown', { key: 'ArrowUp' })

    expect(readSizes(wrapper)).toEqual([49, 51])

    await handle.trigger('keydown', { key: 'ArrowRight' })

    expect(readSizes(wrapper)).toEqual([49, 51])

    wrapper.unmount()
  })

  it('expands a folded pair from the keyboard', async () => {
    const wrapper = mountResizable({ defaultValue: [40, 60] })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    await handle.trigger('keydown', { key: 'ArrowRight' })

    expect(readSizes(wrapper)).toEqual([1, 99])
    expect(handle.attributes('data-collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('ignores the keyboard while disabled', async () => {
    const wrapper = mountResizable({ disabled: true })
    await flush()

    await wrapper.find('.pxd-resizable-handle').trigger('keydown', { key: 'ArrowRight' })

    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('does not drag or fold while disabled', async () => {
    const wrapper = mountResizable({ disabled: true })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    expect(handle.attributes('aria-disabled')).toBe('true')

    drag(handle.element, 500, 700)
    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('exposes the leading position and range as a focusable separator', () => {
    const wrapper = mountResizable({ defaultValue: [30, 70], minSize: [10, 20] })

    const panels = wrapper.findAll('.pxd-resizable-panel')
    const handle = wrapper.find('.pxd-resizable-handle')

    expect(handle.attributes('role')).toBe('separator')
    expect(handle.attributes('tabindex')).toBe('0')
    expect(handle.attributes('aria-label')).toBe('Resize the panels')
    expect(handle.attributes('aria-orientation')).toBe('horizontal')
    expect(handle.attributes('aria-valuenow')).toBe('30')
    expect(handle.attributes('aria-valuemin')).toBe('10')
    expect(handle.attributes('aria-valuemax')).toBe('80')
    expect(handle.attributes('aria-valuetext')).toBe('30%')
    expect(panels[0]!.attributes('id')).toBeTruthy()
    expect(panels[1]!.attributes('id')).toBeTruthy()
    expect(handle.attributes('aria-controls')).toBe(
      `${panels[0]!.attributes('id')} ${panels[1]!.attributes('id')}`,
    )

    // aria-expanded is not a separator state at any focusability: it marks
    // control over visibility, and folding a panel never hides it.
    expect(handle.attributes('aria-expanded')).toBeUndefined()

    wrapper.unmount()
  })

  it('announces the fold through aria-valuetext', async () => {
    const wrapper = mountResizable({ defaultValue: [30, 70], minSize: [10, 0] })
    await flush()

    const handle = wrapper.find('.pxd-resizable-handle')

    expect(handle.attributes('aria-valuetext')).toBe('30%')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(handle.attributes('aria-valuetext')).toBe('10%, folded')

    wrapper.unmount()
  })

  it('takes the divider out of the tab order while disabled', () => {
    const wrapper = mountResizable({ disabled: true })

    const handle = wrapper.find('.pxd-resizable-handle')

    expect(handle.attributes('tabindex')).toBe('-1')
    expect(handle.attributes('aria-disabled')).toBe('true')

    wrapper.unmount()
  })

  it('warns and keeps the sizes when model-value does not add up to 100%', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountResizable({ modelValue: [60, 60] })
    await flush()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('adds up to 120% instead of 100%'))
    expect(readSizes(wrapper)).toEqual([60, 60])

    wrapper.unmount()
    warn.mockRestore()
  })

  it('warns and takes what it can when model-value is the wrong length', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountResizable({ modelValue: [50] })
    await flush()

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('model-value holds 1 value but the group has 2 panels'),
    )
    expect(readSizes(wrapper)).toEqual([50, 0])

    wrapper.unmount()
    warn.mockRestore()
  })

  it('warns when model-value sits outside the min-size', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountResizable({ modelValue: [10, 90], minSize: [20, 0] })
    await flush()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('outside its 20-100% range'))
    expect(readSizes(wrapper)).toEqual([10, 90])

    wrapper.unmount()
    warn.mockRestore()
  })

  it('warns and takes what it can when min-size is the wrong length', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountResizable({ minSize: [20] })
    await flush()

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('min-size holds 1 value but the group has 2 panels'),
    )

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 0)
    await flush()

    expect(readSizes(wrapper)).toEqual([20, 80])

    wrapper.unmount()
    warn.mockRestore()
  })

  it('warns and ignores min-size values outside 0 to 100', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    mountResizable({ minSize: [120, 0] })
    await flush()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('must be between 0 and 100'))

    warn.mockRestore()
  })

  it('warns and ignores a min-size that no split fits', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountResizable({ minSize: [60, 60] })
    await flush()

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('no split fits'))

    drag(wrapper.find('.pxd-resizable-handle').element, 500, 200)
    await flush()

    // 300px of 1000 is 30%, and nothing constrains the pair any more.
    expect(readSizes(wrapper)).toEqual([20, 80])

    wrapper.unmount()
    warn.mockRestore()
  })

  it('warns when default-value is the wrong length', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountResizable({ defaultValue: [70] })
    await flush()

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('default-value holds 1 value but the group has 2 panels'),
    )
    expect(readSizes(wrapper)).toEqual([70, 0])

    wrapper.unmount()
    warn.mockRestore()
  })
})
