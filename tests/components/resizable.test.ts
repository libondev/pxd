import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, ref } from 'vue'
import Resizable from '../../src/components/resizable/index.vue'
import {
  CONTAINER_SIZE,
  createPointerEvent,
  drag,
  flush,
  readSizes,
  roundSizes,
  setContainerSize,
  setElementSize,
  total,
} from '../helpers/resizable'
import { installResizeObserverMock } from '../helpers/setup'

function slots(leading = 'A', trailing = 'B') {
  return { leading: () => leading, trailing: () => trailing }
}

function mountResizable(
  props: Record<string, unknown> = {},
  scoped: Record<string, (...args: any[]) => unknown> = slots(),
  ref?: { value: any },
) {
  const wrapper = mount(Resizable, { props, slots: scoped })

  if (ref) {
    ref.value = wrapper.vm
  }

  return wrapper
}

/** Park the rAF callbacks so a test can step one drag frame at a time. */
function stubFrames() {
  const frames: FrameRequestCallback[] = []
  const original = globalThis.requestAnimationFrame

  globalThis.requestAnimationFrame = ((frame: FrameRequestCallback) => frames.push(frame)) as any

  return {
    run() {
      frames.splice(0).forEach((frame) => frame(0))
    },
    restore() {
      globalThis.requestAnimationFrame = original
    },
  }
}

describe('resizable', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('renders both panel slots', () => {
    const wrapper = mountResizable()

    expect(wrapper.findAll('.pxd-resizable--panel')).toHaveLength(2)
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
    expect(wrapper.find('.pxd-resizable--handle').attributes('aria-orientation')).toBe('horizontal')

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
    const wrapper = mountResizable(
      { defaultValue: [30, 70] },
      {
        leading: ({ size }: { size: number }) => `L${size}`,
        trailing: ({ size }: { size: number }) => `T${size}`,
      },
    )

    expect(wrapper.text()).toContain('L30')
    expect(wrapper.text()).toContain('T70')

    wrapper.unmount()
  })

  it('keeps the slot size settled while the drag moves the panel', async () => {
    const frames: FrameRequestCallback[] = []
    const originalRaf = globalThis.requestAnimationFrame

    globalThis.requestAnimationFrame = ((frame: FrameRequestCallback) => frames.push(frame)) as any

    const renders: number[] = []
    const Probe = defineComponent({
      props: { size: { type: Number, required: true } },
      setup: (props) => () => {
        renders.push(props.size)

        return h('span', String(props.size))
      },
    })
    const wrapper = mountResizable(
      { defaultValue: [30, 70] },
      { leading: ({ size }: { size: number }) => h(Probe, { size }), trailing: () => 'B' },
    )
    const handle = wrapper.find('.pxd-resizable--handle')

    expect(renders).toEqual([30])

    handle.element.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 600 }))
    frames.forEach((frame) => frame(0))
    globalThis.requestAnimationFrame = originalRaf
    await flush()

    expect(readSizes(wrapper)).toEqual([40, 60])
    expect(renders).toEqual([30])

    handle.element.dispatchEvent(createPointerEvent('pointerup', { x: 600 }))
    await flush()

    expect(renders).toEqual([30, 40])
    expect(wrapper.text()).toContain('40')

    wrapper.unmount()
  })

  it('settles the slot size on a keyboard step', async () => {
    const wrapper = mountResizable(
      { defaultValue: [30, 70] },
      { leading: ({ size }: { size: number }) => `L${size}`, trailing: () => 'B' },
    )

    await wrapper.find('.pxd-resizable--handle').trigger('keydown', { key: 'ArrowRight' })
    await flush()

    expect(wrapper.text()).toContain('L31')

    wrapper.unmount()
  })

  it('settles the slot size when a drag is cancelled', async () => {
    const frames: FrameRequestCallback[] = []
    const originalRaf = globalThis.requestAnimationFrame

    globalThis.requestAnimationFrame = ((frame: FrameRequestCallback) => frames.push(frame)) as any

    const wrapper = mountResizable(
      { defaultValue: [30, 70] },
      { leading: ({ size }: { size: number }) => `L${size}`, trailing: () => 'B' },
    )
    const handle = wrapper.find('.pxd-resizable--handle')

    handle.element.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 600 }))
    frames.forEach((frame) => frame(0))
    globalThis.requestAnimationFrame = originalRaf
    await flush()

    expect(readSizes(wrapper)).toEqual([40, 60])
    expect(wrapper.text()).toContain('L30')

    handle.element.dispatchEvent(createPointerEvent('pointercancel', { x: 600 }))
    await flush()

    expect(wrapper.text()).toContain('L40')

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

    const handles = wrapper.findAll('.pxd-resizable--handle')

    expect(handles).toHaveLength(2)
    expect(handles[0]!.attributes('data-orientation')).toBe('horizontal')
    expect(handles[1]!.attributes('data-orientation')).toBe('vertical')

    wrapper.unmount()
  })

  it('resizes along the y axis when vertical', async () => {
    const wrapper = mountResizable({ direction: 'vertical' })
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 650, 'y')
    await flush()

    expect(readSizes(wrapper)).toEqual([65, 35])

    wrapper.unmount()
  })

  it('emits update:model-value on drag and change once on pointerup', async () => {
    const wrapper = mountResizable()
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle').element

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 650 }))

    expect(wrapper.emitted('change')).toBeUndefined()

    handle.dispatchEvent(createPointerEvent('pointerup', { x: 650 }))
    await flush()

    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([[65, 35]])
    expect(wrapper.emitted('change')).toEqual([[[65, 35]]])

    wrapper.unmount()
  })

  it('does not emit change when a drag ends without moving', async () => {
    const wrapper = mountResizable()
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 500)
    await flush()

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('stops the leading panel at its min-size', async () => {
    const wrapper = mountResizable({ minSize: [20, 0] })
    await flush()

    // 15% is under the 20% floor but still above the 10% fold threshold.
    drag(wrapper.find('.pxd-resizable--handle').element, 500, 150)
    await flush()

    expect(readSizes(wrapper)).toEqual([20, 80])

    wrapper.unmount()
  })

  it("caps the leading panel at 100 minus the trailing panel's min-size", async () => {
    const wrapper = mountResizable({ minSize: [0, 40] })
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 1000)
    await flush()

    expect(readSizes(wrapper)).toEqual([60, 40])

    wrapper.unmount()
  })

  it('never breaks the 100% sum while dragging against the min-size', async () => {
    const wrapper = mountResizable({ minSize: [15, 10] })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle').element

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

    const handle = wrapper.find('.pxd-resizable--handle').element

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

  it('resets to default-value on double click', async () => {
    const wrapper = mountResizable({ defaultValue: [30, 70], minSize: [10, 0] })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    drag(handle.element, 500, 550)
    await flush()

    expect(readSizes(wrapper)).toEqual([35, 65])

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([30, 70])
    expect(handle.attributes('data-collapsed')).toBeUndefined()
    expect(wrapper.emitted('reset')).toEqual([[[30, 70]]])

    wrapper.unmount()
  })

  it('clamps a double click reset into the bounds', async () => {
    const wrapper = mountResizable({ defaultValue: [10, 90], minSize: [20, 0] })
    await flush()

    wrapper.find('.pxd-resizable--handle').element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([20, 80])

    wrapper.unmount()
  })

  it('folds to zero and back with dblclick-action="fold"', async () => {
    const wrapper = mountResizable({ defaultValue: [40, 60], dblclickAction: 'fold' })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])
    expect(handle.attributes('data-collapsed')).toBe('true')
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]])

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([40, 60])
    expect(handle.attributes('data-collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('expands a folded pair when it is dragged', async () => {
    const wrapper = mountResizable({ defaultValue: [40, 60], dblclickAction: 'fold' })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    drag(handle.element, 500, 600)
    await flush()

    expect(readSizes(wrapper)).toEqual([10, 90])
    expect(handle.attributes('data-collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('reset restores default-value and expands a folded pair', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { defaultValue: [40, 60], dblclickAction: 'fold' },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

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

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 600)
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

    expect(plain.find('.pxd-resizable--handle-thumb').exists()).toBe(false)
    expect(gripped.find('.pxd-resizable--handle-thumb').exists()).toBe(true)

    plain.unmount()
    gripped.unmount()
  })

  it('moves the divider with the arrow keys, and by 10% with shift', async () => {
    const wrapper = mountResizable()
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

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

    const handle = wrapper.find('.pxd-resizable--handle')

    await handle.trigger('keydown', { key: 'Home' })

    expect(readSizes(wrapper)).toEqual([20, 80])

    await handle.trigger('keydown', { key: 'End' })

    expect(readSizes(wrapper)).toEqual([70, 30])

    wrapper.unmount()
  })

  it('resizes with the y arrows only when the group is vertical', async () => {
    const wrapper = mountResizable({ direction: 'vertical' })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    await handle.trigger('keydown', { key: 'ArrowUp' })

    expect(readSizes(wrapper)).toEqual([49, 51])

    await handle.trigger('keydown', { key: 'ArrowRight' })

    expect(readSizes(wrapper)).toEqual([49, 51])

    wrapper.unmount()
  })

  it('expands a folded pair from the keyboard', async () => {
    const wrapper = mountResizable({ defaultValue: [40, 60], dblclickAction: 'fold' })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])

    await handle.trigger('keydown', { key: 'ArrowRight' })

    // Expanding gives back the 40 the user folded, then the step applies.
    expect(readSizes(wrapper)).toEqual([41, 59])
    expect(handle.attributes('data-collapsed')).toBeUndefined()

    wrapper.unmount()
  })

  it('ignores the keyboard while disabled', async () => {
    const wrapper = mountResizable({ disabled: true })
    await flush()

    await wrapper.find('.pxd-resizable--handle').trigger('keydown', { key: 'ArrowRight' })

    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('does not drag or fold while disabled', async () => {
    const wrapper = mountResizable({ disabled: true })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    expect(handle.attributes('aria-disabled')).toBe('true')

    drag(handle.element, 500, 700)
    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('exposes the leading position and range as a focusable separator', () => {
    const wrapper = mountResizable({ defaultValue: [30, 70], minSize: [10, 20] })

    const panels = wrapper.findAll('.pxd-resizable--panel')
    const handle = wrapper.find('.pxd-resizable--handle')

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

  it('drops the separator range once folded', async () => {
    const wrapper = mountResizable({
      defaultValue: [30, 70],
      minSize: [10, 0],
      dblclickAction: 'fold',
    })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    expect(handle.attributes('aria-valuetext')).toBe('30%')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(handle.attributes('role')).toBe('separator')
    expect(handle.attributes('tabindex')).toBe('-1')
    expect(handle.attributes('aria-valuenow')).toBeUndefined()
    expect(handle.attributes('aria-valuemin')).toBeUndefined()
    expect(handle.attributes('aria-valuemax')).toBeUndefined()
    expect(handle.attributes('aria-valuetext')).toBeUndefined()

    wrapper.unmount()
  })

  it('takes the divider out of the tab order while disabled', () => {
    const wrapper = mountResizable({ disabled: true })

    const handle = wrapper.find('.pxd-resizable--handle')

    expect(handle.attributes('tabindex')).toBe('-1')
    expect(handle.attributes('aria-disabled')).toBe('true')

    wrapper.unmount()
  })

  it('keeps the sizes when model-value does not add up to 100%', async () => {
    const wrapper = mountResizable({ modelValue: [60, 60] })
    await flush()

    expect(readSizes(wrapper)).toEqual([60, 60])

    wrapper.unmount()
  })

  it('takes what it can when model-value is the wrong length', async () => {
    const wrapper = mountResizable({ modelValue: [50] })
    await flush()

    expect(readSizes(wrapper)).toEqual([50, 0])

    wrapper.unmount()
  })

  it('keeps a model-value that sits outside the min-size', async () => {
    const wrapper = mountResizable({ modelValue: [10, 90], minSize: [20, 0] })
    await flush()

    expect(readSizes(wrapper)).toEqual([10, 90])

    wrapper.unmount()
  })

  it('takes what it can when min-size is the wrong length', async () => {
    const wrapper = mountResizable({ minSize: [20] })
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 150)
    await flush()

    expect(readSizes(wrapper)).toEqual([20, 80])

    wrapper.unmount()
  })

  it('ignores min-size values outside 0 to 100', async () => {
    const wrapper = mountResizable({ minSize: [120, 0] })
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 800)
    await flush()

    expect(readSizes(wrapper)).toEqual([80, 20])

    wrapper.unmount()
  })

  it('ignores a min-size that no split fits', async () => {
    const wrapper = mountResizable({ minSize: [60, 60] })
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 200)
    await flush()

    // 300px of 1000 is 30%, and nothing constrains the pair any more.
    expect(readSizes(wrapper)).toEqual([20, 80])

    wrapper.unmount()
  })

  it('takes what it can when default-value is the wrong length', async () => {
    const wrapper = mountResizable({ defaultValue: [70] })
    await flush()

    expect(readSizes(wrapper)).toEqual([70, 0])

    wrapper.unmount()
  })

  it('renders a pinned leading panel and a filling trailing one', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable({ unit: 'px', defaultValue: [320, 680] }, slots(), exposed)
    await flush()

    const panels = wrapper.findAll('.pxd-resizable--panel')

    expect(panels[0].attributes('style')).toContain('flex-basis: 320px')
    expect(panels[1].attributes('style') || '').not.toContain('flex-basis')
    expect(exposed.value.getPanelSizes()).toEqual([320, 680])
    expect(wrapper.attributes('data-unit')).toBe('px')
    expect(wrapper.find('.pxd-resizable--handle').attributes('aria-valuetext')).toBe('320px')

    wrapper.unmount()
  })

  it('lets the trailing panel follow a container resize', async () => {
    const observers = installResizeObserverMock()
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [320] },
      {
        leading: ({ size }: { size: number }) => `L${size}`,
        trailing: ({ size }: { size: number }) => `T${size}`,
      },
      exposed,
    )
    await flush()

    expect(observers.observed()).toContain(wrapper.element)

    setContainerSize(700)
    observers.fireAll()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([320, 380])
    expect(wrapper.text()).toContain('L320')
    expect(wrapper.text()).toContain('T380')

    setContainerSize(200)
    observers.fireAll()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([320, 0])

    setContainerSize(CONTAINER_SIZE)
    wrapper.unmount()
  })

  it('cannot move a pixel group it has not measured yet', async () => {
    const observers = installResizeObserverMock()
    const exposed = ref<any>()
    const wrapper = mountResizable({ unit: 'px', defaultValue: [320] }, slots(), exposed)
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    setContainerSize(0)
    observers.fireAll()
    await flush()

    expect(handle.attributes('aria-valuenow')).toBe('320')
    expect(handle.attributes('aria-valuemin')).toBe('320')
    expect(handle.attributes('aria-valuemax')).toBe('320')

    drag(handle.element, 500, 600)
    await handle.trigger('keydown', { key: 'Home' })
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([320, 0])

    setContainerSize(CONTAINER_SIZE)
    wrapper.unmount()
  })

  it('takes only the leading size from a controlled pixel group', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable({ unit: 'px', modelValue: [320, 999] }, slots(), exposed)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([320, 680])

    await wrapper.setProps({ modelValue: [500, 999] })
    expect(exposed.value.getPanelSizes()).toEqual([500, 500])

    wrapper.unmount()
  })

  it('defaults to percent sizes', () => {
    const wrapper = mountResizable()

    expect(wrapper.attributes('data-unit')).toBe('percent')
    expect(readSizes(wrapper)).toEqual([50, 50])
    expect(wrapper.find('.pxd-resizable--handle').attributes('aria-valuetext')).toBe('50%')

    wrapper.unmount()
  })

  it('drags the pinned leading panel and lets the trailing one follow', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable({ unit: 'px', defaultValue: [320, 680] }, slots(), exposed)
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 650)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([470, 530])
    expect(wrapper.emitted('change')).toEqual([[[470, 530]]])
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([[470, 530]])

    wrapper.unmount()
  })

  it('steps pixel sizes from the keyboard', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable({ unit: 'px', defaultValue: [320, 680] }, slots(), exposed)
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    await handle.trigger('keydown', { key: 'ArrowRight' })
    expect(exposed.value.getPanelSizes()).toEqual([321, 679])

    await handle.trigger('keydown', { key: 'ArrowRight', shiftKey: true })
    expect(exposed.value.getPanelSizes()).toEqual([331, 669])

    wrapper.unmount()
  })

  it('clamps pixel sizes to their pixel min-size', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [320, 680], minSize: [100, 100] },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    expect(handle.attributes('aria-valuemin')).toBe('100')
    expect(handle.attributes('aria-valuemax')).toBe('900')

    // 90px is under the 100px floor but still above the 50px fold threshold.
    drag(handle.element, 500, 270)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([100, 900])

    wrapper.unmount()
  })

  it('ignores pixel min-sizes that no split fits', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [320, 680], minSize: [600, 600] },
      slots(),
      exposed,
    )
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 0)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([0, 1000])

    wrapper.unmount()
  })

  it('folds a pixel pair to zero and gives back its width', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [320, 680], minSize: [120, 0], dblclickAction: 'fold' },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([0, 1000])
    expect(handle.attributes('aria-valuetext')).toBeUndefined()

    handle.element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([320, 680])

    wrapper.unmount()
  })

  it('holds at the pixel floor and folds once the pointer passes the threshold', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [256], minSize: [180, 0] },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle').element
    const frames = stubFrames()

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 380 }))
    frames.run()
    await flush()

    // 136 is under the floor but still above the 90 threshold.
    expect(exposed.value.getPanelSizes()).toEqual([180, 820])

    handle.dispatchEvent(createPointerEvent('pointermove', { x: 320 }))
    frames.run()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([0, 1000])
    expect(wrapper.find('.pxd-resizable--handle').attributes('data-collapsed')).toBe('true')
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]])

    frames.restore()
    wrapper.unmount()
  })

  it('unfolds in the same gesture once the pointer comes back past the threshold', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [256], minSize: [180, 0] },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle').element
    const frames = stubFrames()

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 320 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 250 }))
    frames.run()
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 320 }))
    frames.run()
    await flush()

    // Back at the fold point, not past it: still folded.
    expect(exposed.value.getPanelSizes()).toEqual([0, 1000])

    handle.dispatchEvent(createPointerEvent('pointermove', { x: 345 }))
    frames.run()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([180, 820])
    expect(wrapper.emitted('update:collapsed')).toEqual([[true], [false]])

    handle.dispatchEvent(createPointerEvent('pointermove', { x: 450 }))
    frames.run()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([206, 794])

    frames.restore()
    wrapper.unmount()
  })

  it('commits a folded pair only on pointerup', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [256], minSize: [180, 0] },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle').element
    const frames = stubFrames()

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 320 }))
    frames.run()
    await flush()

    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([[0, 1000]])

    handle.dispatchEvent(createPointerEvent('pointerup', { x: 320 }))
    await flush()

    expect(wrapper.emitted('change')).toEqual([[[0, 1000]]])
    expect(exposed.value.getPanelSizes()).toEqual([0, 1000])

    frames.restore()
    wrapper.unmount()
  })

  it('unfolds a collapsed pair when the handle is dragged right', async () => {
    const sizes = ref([256, 744])
    const collapsed = ref(true)

    const Host = defineComponent({
      setup: () => () =>
        h(
          Resizable,
          {
            unit: 'px',
            minSize: [180, 0],
            defaultValue: [256, 0],
            modelValue: sizes.value,
            'onUpdate:modelValue': (value: number[]) => (sizes.value = value),
            collapsed: collapsed.value,
            'onUpdate:collapsed': (value: boolean) => (collapsed.value = value),
          },
          slots(),
        ),
    })

    const wrapper = mount(Host)
    await flush()

    expect(collapsed.value).toBe(true)

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 620)
    await flush()

    expect(collapsed.value).toBe(false)
    expect(sizes.value).toEqual([200, 800])

    wrapper.unmount()
  })

  it('opens a collapsed pair only after a real drag', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [256], minSize: [180, 0], collapsed: true },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')
    const frames = stubFrames()

    handle.element.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 509 }))
    frames.run()
    await flush()

    expect(handle.attributes('data-collapsed')).toBe('true')
    expect(exposed.value.getPanelSizes()).toEqual([0, 1000])

    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 512 }))
    frames.run()
    await flush()

    expect(handle.attributes('data-collapsed')).toBeUndefined()
    expect(exposed.value.getPanelSizes()).toEqual([180, 820])

    frames.restore()
    wrapper.unmount()
  })

  it('follows the collapsed prop and reports aria from the floor', async () => {
    const wrapper = mountResizable({
      unit: 'px',
      defaultValue: [256],
      minSize: [180, 0],
      collapsed: true,
    })
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    expect(wrapper.findAll('.pxd-resizable--panel')[0].attributes('style')).toContain(
      'flex-basis: 0px',
    )
    expect(wrapper.findAll('.pxd-resizable--panel')[0].element.hasAttribute('inert')).toBe(true)
    expect(wrapper.findAll('.pxd-resizable--panel')[1].element.hasAttribute('inert')).toBe(false)
    expect(handle.attributes('tabindex')).toBe('-1')
    expect(handle.attributes('aria-valuemin')).toBeUndefined()
    expect(handle.attributes('aria-valuetext')).toBeUndefined()

    await wrapper.setProps({ collapsed: false })
    await flush()

    expect(wrapper.findAll('.pxd-resizable--panel')[0].attributes('style')).toContain(
      'flex-basis: 256px',
    )
    expect(wrapper.findAll('.pxd-resizable--panel')[0].element.hasAttribute('inert')).toBe(false)
    expect(handle.attributes('tabindex')).toBe('0')
    expect(handle.attributes('aria-valuemin')).toBe('180')
    expect(handle.attributes('aria-valuetext')).toBe('256px')

    wrapper.unmount()
  })

  it('marks a panel squeezed to zero as inert', async () => {
    const wrapper = mountResizable({ modelValue: [100, 0] })
    await flush()

    expect(wrapper.findAll('.pxd-resizable--panel')[1].element.hasAttribute('inert')).toBe(true)

    await wrapper.setProps({ modelValue: [40, 60] })
    await flush()

    expect(wrapper.findAll('.pxd-resizable--panel')[1].element.hasAttribute('inert')).toBe(false)

    wrapper.unmount()
  })

  it('resets and unfolds a folded pair on double click', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', defaultValue: [256], minSize: [180, 0] },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle').element
    const frames = stubFrames()

    handle.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.dispatchEvent(createPointerEvent('pointermove', { x: 320 }))
    handle.dispatchEvent(createPointerEvent('pointerup', { x: 320 }))
    frames.run()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([0, 1000])

    handle.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([256, 744])
    expect(wrapper.emitted('update:collapsed')).toEqual([[true], [false]])
    expect(wrapper.emitted('reset')).toEqual([[[256, 744]]])

    frames.restore()
    wrapper.unmount()
  })

  it('marks the divider flush once either panel is empty', async () => {
    const wrapper = mountResizable()
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')

    expect(handle.attributes('data-flush')).toBeUndefined()

    drag(handle.element, 500, 0)
    await flush()

    expect(readSizes(wrapper)).toEqual([0, 100])
    expect(handle.attributes('data-flush')).toBe('true')

    drag(handle.element, 500, 1500)
    await flush()

    expect(readSizes(wrapper)).toEqual([100, 0])
    expect(handle.attributes('data-flush')).toBe('true')

    wrapper.unmount()
  })

  it('pins the trailing panel when reversed', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', reverse: true, defaultValue: [0, 320], minSize: [240, 200] },
      slots('mid', 'right'),
      exposed,
    )
    await flush()

    const panels = wrapper.findAll('.pxd-resizable--panel')

    expect(exposed.value.getPanelSizes()).toEqual([680, 320])
    expect(panels[0].attributes('style') || '').not.toContain('flex-basis')
    expect(panels[1].attributes('style')).toContain('flex-basis: 320px')
    expect(wrapper.attributes('data-reverse')).toBe('true')
    expect(wrapper.find('.pxd-resizable--handle').attributes('aria-valuenow')).toBe('680')

    wrapper.unmount()
  })

  it('drags the leading panel against a pinned trailing one in reverse', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', reverse: true, defaultValue: [0, 320], minSize: [240, 200] },
      slots(),
      exposed,
    )
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 620)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([800, 200])
    expect(wrapper.emitted('update:model-value')?.at(-1)).toEqual([[800, 200]])
    expect(wrapper.emitted('change')).toEqual([[[800, 200]]])

    wrapper.unmount()
  })

  it('folds the trailing panel past its threshold in reverse', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', reverse: true, defaultValue: [0, 320], minSize: [240, 200] },
      slots(),
      exposed,
    )
    await flush()

    const handle = wrapper.find('.pxd-resizable--handle')
    const frames = stubFrames()

    // The default threshold is half the trailing floor, i.e. 100px left of the pinned width.
    handle.element.dispatchEvent(createPointerEvent('pointerdown', { x: 500 }))
    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 700 }))
    frames.run()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([800, 200])
    expect(handle.attributes('data-collapsed')).toBeUndefined()

    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 720 }))
    frames.run()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([1000, 0])
    expect(handle.attributes('data-collapsed')).toBe('true')
    expect(wrapper.emitted('update:collapsed')).toEqual([[true]])

    handle.element.dispatchEvent(createPointerEvent('pointermove', { x: 700 }))
    frames.run()
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([800, 200])
    expect(wrapper.emitted('update:collapsed')).toEqual([[true], [false]])

    handle.element.dispatchEvent(createPointerEvent('pointerup', { x: 700 }))
    await flush()

    expect(wrapper.emitted('change')).toEqual([[[800, 200]]])

    frames.restore()
    wrapper.unmount()
  })

  it('resets to the configured trailing width in reverse', async () => {
    const exposed = ref<any>()
    const wrapper = mountResizable(
      { unit: 'px', reverse: true, defaultValue: [0, 320], minSize: [240, 200] },
      slots(),
      exposed,
    )
    await flush()

    drag(wrapper.find('.pxd-resizable--handle').element, 500, 700)
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([800, 200])

    wrapper.find('.pxd-resizable--handle').element.dispatchEvent(createPointerEvent('dblclick'))
    await flush()

    expect(exposed.value.getPanelSizes()).toEqual([680, 320])
    expect(wrapper.emitted('reset')).toEqual([[[680, 320]]])

    wrapper.unmount()
  })

  it('keeps the trailing column pinned while the outer divider moves', async () => {
    const observers = installResizeObserverMock()
    const left = ref([256, 0])
    const right = ref([0, 320])
    const inner = ref<any>()

    const Host = defineComponent({
      setup: () => () =>
        h(
          Resizable,
          {
            unit: 'px',
            minSize: [180, 440],
            modelValue: left.value,
            'onUpdate:modelValue': (value: number[]) => (left.value = value),
          },
          {
            leading: () => 'left',
            trailing: () =>
              h(
                Resizable,
                {
                  ref: inner,
                  unit: 'px',
                  reverse: true,
                  minSize: [240, 200],
                  modelValue: right.value,
                  'onUpdate:modelValue': (value: number[]) => (right.value = value),
                },
                slots('mid', 'right'),
              ),
          },
        ),
    })

    const wrapper = mount(Host)
    await flush()

    const innerElement = wrapper.findAll('.pxd-resizable')[1].element as HTMLElement

    setElementSize(innerElement, 744)
    observers.fireAll()
    await flush()

    expect(inner.value.getPanelSizes()).toEqual([424, 320])

    drag(wrapper.findAll('.pxd-resizable--handle')[0].element, 500, 600)
    await flush()

    expect(left.value).toEqual([356, 644])

    setElementSize(innerElement, 644)
    observers.fireAll()
    await flush()

    // The right column keeps its 320px; the middle absorbs the 100px the divider took.
    expect(right.value).toEqual([0, 320])
    expect(inner.value.getPanelSizes()).toEqual([324, 320])

    wrapper.unmount()
  })
})
