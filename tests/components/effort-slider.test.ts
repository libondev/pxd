import { mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import EffortSlider from '../../src/components/effort-slider/index.vue'

const OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Max', value: 'max' },
]

function stubTrack(wrapper: ReturnType<typeof mount>) {
  const track = wrapper.find('.pxd-effort-slider--track')

  track.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

  return track
}

function stubWidths(sizes: Array<[Element, number]>) {
  // happy-dom has no layout, so the layout widths come from these stubs.
  sizes.forEach(([element, width]) => {
    Object.defineProperty(element, 'clientWidth', { configurable: true, value: width })
    Object.defineProperty(element, 'offsetWidth', { configurable: true, value: width })
  })
}

function dispatch(type: string, clientX: number) {
  document.dispatchEvent(new PointerEvent(type, { clientX }))
}

function mountSynced(modelValue = 'low') {
  const wrapper = mount(EffortSlider, {
    props: {
      options: OPTIONS,
      modelValue,
      'onUpdate:modelValue': (value: string | number) => wrapper.setProps({ modelValue: value }),
    },
  })

  return wrapper
}

describe('effort-slider', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should snap a missing modelValue to the first option on mount', () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS } })

    expect(wrapper.emitted('update:model-value')).toEqual([['low']])

    wrapper.unmount()
  })

  it('should keep its own level without modelValue', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, defaultValue: 'medium' } })
    const thumb = wrapper.find('.pxd-effort-slider--thumb')

    await thumb.trigger('keydown', { code: 'ArrowRight' })

    expect(wrapper.emitted('update:model-value')).toEqual([['high']])
    expect(wrapper.emitted('change')).toEqual([['high']])
    expect(thumb.attributes('style')).toContain('66.66')
    expect(wrapper.find('.pxd-effort-slider--label').text()).toBe('High')

    wrapper.unmount()
  })

  it('should follow the pointer in an uncontrolled drag', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, defaultValue: 'low' } })
    const track = stubTrack(wrapper)
    const thumb = wrapper.find('.pxd-effort-slider--thumb')

    await track.trigger('pointerdown', { clientX: 70 })
    await nextTick()

    expect(wrapper.emitted('update:model-value')).toEqual([['high']])
    expect(thumb.attributes('style')).toContain('left: 70%')

    dispatch('pointerup', 70)
    await nextTick()

    expect(wrapper.emitted('change')).toEqual([['high']])
    expect(thumb.attributes('style')).toContain('66.66')

    wrapper.unmount()
  })

  it('should ignore defaultValue once modelValue is bound', () => {
    const wrapper = mount(EffortSlider, {
      props: { options: OPTIONS, defaultValue: 'low', modelValue: 'max' },
    })

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.find('.pxd-effort-slider--label').text()).toBe('Max')

    wrapper.unmount()
  })

  it('should keep a matching modelValue untouched on mount', () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'high' } })

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain(
      'clip-path: inset(0 33.33',
    )

    wrapper.unmount()
  })

  it('should accept plain strings as options', () => {
    const wrapper = mount(EffortSlider, { props: { options: ['low', 'high'], modelValue: 'high' } })

    expect(wrapper.find('.pxd-effort-slider--label').text()).toBe('high')

    wrapper.unmount()
  })

  it('should render a tick for every interior level', () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })

    expect(wrapper.findAll('.pxd-effort-slider--tick').length).toBe(2)

    wrapper.unmount()
  })

  it('should render particles inside the fill only when particles is on', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'high' } })
    const fill = wrapper.find('.pxd-effort-slider--fill')

    expect(fill.findAll('.pxd-effort-slider--particle')).toHaveLength(0)

    await wrapper.setProps({ particles: true })

    expect(fill.findAll('.pxd-effort-slider--particle')).toHaveLength(16)

    wrapper.unmount()
  })

  it('should jump to the pressed level', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 20 })

    expect(wrapper.emitted('update:model-value')).toEqual([['medium']])
    expect(wrapper.emitted('change')).toBeUndefined()

    dispatch('pointerup', 20)

    expect(wrapper.emitted('change')).toEqual([['medium']])

    wrapper.unmount()
  })

  it('should snap ties to the lower level', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)

    // 50 sits exactly between the medium and the high level.
    await track.trigger('pointerdown', { clientX: 50 })

    expect(wrapper.emitted('update:model-value')).toEqual([['medium']])

    wrapper.unmount()
  })

  it('should not emit anything when the pressed level is the current one', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 0 })
    dispatch('pointerup', 0)

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('should start dragging as soon as the track is pressed', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 0 })
    await nextTick()

    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('data-dragging')).toBe('true')

    dispatch('pointermove', 70)
    await vi.advanceTimersByTimeAsync(32)

    expect(wrapper.emitted('update:model-value')).toEqual([['high']])

    dispatch('pointerup', 70)
    await nextTick()

    expect(wrapper.emitted('change')).toEqual([['high']])
    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('data-dragging')).toBe('false')

    wrapper.unmount()
  })

  it('should start dragging when the thumb is pressed', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const thumb = wrapper.find('.pxd-effort-slider--thumb')

    stubTrack(wrapper)

    await thumb.trigger('pointerdown', { clientX: 0 })
    dispatch('pointermove', 100)
    await vi.advanceTimersByTimeAsync(32)

    expect(wrapper.emitted('update:model-value')).toEqual([['max']])

    wrapper.unmount()
  })

  it('should follow the pointer between levels and snap on release', async () => {
    const wrapper = mountSynced()
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 0 })
    dispatch('pointermove', 45)
    await vi.advanceTimersByTimeAsync(32)

    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('style')).toContain('left: 45%')
    expect(wrapper.emitted('update:model-value')).toEqual([['medium']])

    dispatch('pointerup', 45)
    await nextTick()

    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('style')).toContain('33.33')
    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('data-dragging')).toBe('false')
    expect(wrapper.emitted('change')).toEqual([['medium']])

    wrapper.unmount()
  })

  it('should drop the transient position when the drag is cancelled', async () => {
    const wrapper = mountSynced()
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 0 })
    dispatch('pointermove', 60)
    await vi.advanceTimersByTimeAsync(32)
    dispatch('pointercancel', 60)
    await nextTick()

    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('style')).toContain('66.66')
    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('data-dragging')).toBe('false')
    expect(wrapper.emitted('update:model-value')).toEqual([['high']])
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('should not emit change when a drag ends on the level it started from', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 0 })
    dispatch('pointermove', 10)
    await vi.advanceTimersByTimeAsync(32)
    dispatch('pointerup', 10)

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('should move a level with the arrow keys', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const thumb = wrapper.find('.pxd-effort-slider--thumb')

    await thumb.trigger('keydown', { code: 'ArrowRight' })
    expect(wrapper.emitted('change')).toEqual([['medium']])

    await wrapper.setProps({ modelValue: 'medium' })
    await thumb.trigger('keydown', { code: 'ArrowDown' })
    expect(wrapper.emitted('change')).toEqual([['medium'], ['low']])

    wrapper.unmount()
  })

  it('should stop at both ends when pressing the arrow keys', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'max' } })
    const thumb = wrapper.find('.pxd-effort-slider--thumb')

    await thumb.trigger('keydown', { code: 'ArrowUp' })
    expect(wrapper.emitted('update:model-value')).toBeUndefined()

    await thumb.trigger('keydown', { code: 'ArrowLeft' })
    expect(wrapper.emitted('change')).toEqual([['high']])

    wrapper.unmount()
  })

  it('should jump to the first and the last level with Home and End', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'high' } })
    const thumb = wrapper.find('.pxd-effort-slider--thumb')

    await thumb.trigger('keydown', { code: 'Home' })
    expect(wrapper.emitted('change')).toEqual([['low']])

    await wrapper.setProps({ modelValue: 'high' })
    await thumb.trigger('keydown', { code: 'End' })
    expect(wrapper.emitted('change')).toEqual([['low'], ['max']])

    wrapper.unmount()
  })

  it('should keep the label centred on the thumb on every level', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })

    const labelClasses = () => wrapper.find('.pxd-effort-slider--label').classes()

    expect(labelClasses()).toContain('left-1/2')
    expect(labelClasses()).not.toContain('left-0')

    await wrapper.setProps({ modelValue: 'max' })

    expect(labelClasses()).toContain('left-1/2')
    expect(labelClasses()).not.toContain('left-full')

    wrapper.unmount()
  })

  it('should clamp the label of the initial level before it becomes visible', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'max' } })
    const track = stubTrack(wrapper)
    const thumb = wrapper.find('.pxd-effort-slider--thumb')
    const label = wrapper.find('.pxd-effort-slider--label')

    stubWidths([
      [track.element, 100],
      [label.element, 40],
    ])

    await thumb.trigger('focus')

    expect(label.attributes('style')).toContain('-20px')

    wrapper.unmount()
  })

  it('should keep the label inside the track when it is clamped', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)
    const label = wrapper.find('.pxd-effort-slider--label')

    stubWidths([
      [track.element, 100],
      [label.element, 40],
    ])

    await wrapper.setProps({ modelValue: 'max' })

    // A 40px label centred on 100% of a 100px track would end at 120px, so it is pulled
    // 20px back to sit flush with the track's right edge.
    expect(label.attributes('style')).toContain('-20px')

    wrapper.unmount()
  })

  it('should fall back to the primary colour when no colours are given', () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })

    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain(
      'var(--color-primary)',
    )

    wrapper.unmount()
  })

  it('should paint the whole fill with the colour of the current level', () => {
    const wrapper = mount(EffortSlider, {
      props: {
        options: OPTIONS,
        modelValue: 'high',
        colors: { 0: 'red', 1: 'green', 2: 'blue', 3: 'orange' },
      },
    })
    const style = wrapper.find('.pxd-effort-slider--fill').attributes('style')

    expect(style).toContain('background: blue')
    expect(style).not.toContain('linear-gradient')

    wrapper.unmount()
  })

  it('should use the colour of the highest threshold at or below the current level', async () => {
    const wrapper = mount(EffortSlider, {
      props: { options: OPTIONS, modelValue: 'medium', colors: { 0: 'red', 2: 'blue' } },
    })
    const style = () => wrapper.find('.pxd-effort-slider--fill').attributes('style')

    expect(style()).toContain('background: red')

    await wrapper.setProps({ modelValue: 'max' })

    expect(style()).toContain('background: blue')

    wrapper.unmount()
  })

  it('should paint a gradient colour as the fill background', () => {
    const wrapper = mount(EffortSlider, {
      props: {
        options: OPTIONS,
        modelValue: 'high',
        colors: { 0: 'linear-gradient(90deg, green, blue)' },
      },
    })
    const style = wrapper.find('.pxd-effort-slider--fill').attributes('style')

    expect(style).toContain('background: linear-gradient(90deg, green, blue)')

    wrapper.unmount()
  })

  it('should fall back to the primary colour below the lowest threshold', () => {
    const wrapper = mount(EffortSlider, {
      props: { options: OPTIONS, modelValue: 'low', colors: { 2: 'blue' } },
    })

    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain(
      'background: var(--color-primary)',
    )

    wrapper.unmount()
  })

  it('should reveal the solid fill up to the pointer while dragging', async () => {
    const wrapper = mount(EffortSlider, {
      props: { options: OPTIONS, modelValue: 'high', colors: { 0: 'red', 2: 'blue' } },
    })
    const fill = () => wrapper.find<HTMLElement>('.pxd-effort-slider--fill').element.style
    const color = fill().backgroundColor

    expect(color).toContain('blue')
    expect(fill().clipPath).toContain('inset(0 33.33')

    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 80 })

    // The parent holds the value back, so the colour stays put while the reveal follows the pointer.
    expect(fill().clipPath).toBe('inset(0 20% 0 0)')
    expect(fill().backgroundColor).toBe(color)

    wrapper.unmount()
  })

  it('should reveal the gradient fill up to the pointer while dragging', async () => {
    const wrapper = mount(EffortSlider, {
      props: {
        options: OPTIONS,
        modelValue: 'high',
        colors: { 0: 'linear-gradient(90deg, green, blue)' },
      },
    })
    const fill = () => wrapper.find<HTMLElement>('.pxd-effort-slider--fill').element.style
    const image = fill().backgroundImage

    expect(image).toContain('linear-gradient')

    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 80 })

    // The image is anchored to the whole track, so the reveal moves while the gradient stays put.
    expect(fill().clipPath).toBe('inset(0 20% 0 0)')
    expect(fill().backgroundImage).toBe(image)

    wrapper.unmount()
  })

  it('should ignore pointer and keyboard interaction while disabled', async () => {
    const wrapper = mount(EffortSlider, {
      props: { options: OPTIONS, modelValue: 'low', disabled: true },
    })
    const track = stubTrack(wrapper)
    const thumb = wrapper.find('.pxd-effort-slider--thumb')

    await track.trigger('pointerdown', { clientX: 100 })
    await thumb.trigger('keydown', { code: 'ArrowRight' })

    expect(wrapper.emitted('update:model-value')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })
})
