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

    expect(wrapper.emitted('update:modelValue')).toEqual([['low']])

    wrapper.unmount()
  })

  it('should keep a matching modelValue untouched on mount', () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'high' } })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain('66.666')

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

  it('should jump to the pressed level', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 20 })

    expect(wrapper.emitted('update:modelValue')).toEqual([['medium']])
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

    expect(wrapper.emitted('update:modelValue')).toEqual([['medium']])

    wrapper.unmount()
  })

  it('should not emit anything when the pressed level is the current one', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 0 })
    dispatch('pointerup', 0)

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
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

    expect(wrapper.emitted('update:modelValue')).toEqual([['high']])

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

    expect(wrapper.emitted('update:modelValue')).toEqual([['max']])

    wrapper.unmount()
  })

  it('should follow the pointer between levels and snap on release', async () => {
    const wrapper = mountSynced()
    const track = stubTrack(wrapper)

    await track.trigger('pointerdown', { clientX: 0 })
    dispatch('pointermove', 45)
    await vi.advanceTimersByTimeAsync(32)

    expect(wrapper.find('.pxd-effort-slider--thumb').attributes('style')).toContain('left: 45%')
    expect(wrapper.emitted('update:modelValue')).toEqual([['medium']])

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
    expect(wrapper.emitted('update:modelValue')).toEqual([['high']])
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

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
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
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

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

    label.element.getBoundingClientRect = () => ({ width: 40 }) as DOMRect
    thumb.element.getBoundingClientRect = () => ({ width: 10 }) as DOMRect
    track.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    await thumb.trigger('focus')

    expect(label.attributes('style')).toContain('-15px')

    wrapper.unmount()
  })

  it('should line the label up with the thumb edge when it is clamped', async () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })
    const track = stubTrack(wrapper)
    const thumb = wrapper.find('.pxd-effort-slider--thumb')
    const label = wrapper.find('.pxd-effort-slider--label')

    // happy-dom has no layout, so the widths come from the rect stubs below.
    label.element.getBoundingClientRect = () => ({ width: 40 }) as DOMRect
    thumb.element.getBoundingClientRect = () => ({ width: 10 }) as DOMRect
    track.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    await wrapper.setProps({ modelValue: 'max' })

    // The thumb sits at 100% of a 100px track, so its right edge is 105px and a 40px
    // label centred there needs a 15px pull back to line up with it.
    expect(label.attributes('style')).toContain('-15px')

    wrapper.unmount()
  })

  it('should fall back to the primary colour when no colours are given', () => {
    const wrapper = mount(EffortSlider, { props: { options: OPTIONS, modelValue: 'low' } })

    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain(
      'var(--color-primary)',
    )

    wrapper.unmount()
  })

  it('should colour the fill by the current level', async () => {
    const wrapper = mount(EffortSlider, {
      props: { options: OPTIONS, modelValue: 'low', colors: { 0: 'red', 2: 'blue' } },
    })

    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain('red')

    await wrapper.setProps({ modelValue: 'medium' })
    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain('red')

    await wrapper.setProps({ modelValue: 'high' })
    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain('blue')

    await wrapper.setProps({ modelValue: 'max' })
    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain('blue')

    wrapper.unmount()
  })

  it('should fall back to the primary colour when the lowest level has none', () => {
    const wrapper = mount(EffortSlider, {
      props: { options: OPTIONS, modelValue: 'low', colors: { 1: 'red' } },
    })

    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain(
      'var(--color-primary)',
    )

    wrapper.unmount()
  })

  it('should keep a gradient value for a level', () => {
    const wrapper = mount(EffortSlider, {
      props: {
        options: OPTIONS,
        modelValue: 'low',
        colors: { 0: 'linear-gradient(90deg, red, blue)' },
      },
    })

    expect(wrapper.find('.pxd-effort-slider--fill').attributes('style')).toContain(
      'linear-gradient(90deg, red, blue)',
    )

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

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })
})
