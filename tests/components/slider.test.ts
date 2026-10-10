import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Slider from '../../src/components/slider/index.vue'

describe('slider', () => {
  it('renders properly', () => {
    const wrapper = mount(Slider)

    expect(wrapper.find('.pxd-slider').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default min to 0', () => {
    const wrapper = mount(Slider)

    expect(wrapper.props('min')).toBe(0)

    wrapper.unmount()
  })

  it('should default max to 100', () => {
    const wrapper = mount(Slider)

    expect(wrapper.props('max')).toBe(100)

    wrapper.unmount()
  })

  it('should default step to 1', () => {
    const wrapper = mount(Slider)

    expect(wrapper.props('step')).toBe(1)

    wrapper.unmount()
  })

  it('should default modelValue to 0', () => {
    const wrapper = mount(Slider)

    expect(wrapper.props('modelValue')).toBe(0)

    wrapper.unmount()
  })

  it('should accept custom min and max', () => {
    const wrapper = mount(Slider, {
      props: {
        min: 10,
        max: 50,
      },
    })

    expect(wrapper.props('min')).toBe(10)
    expect(wrapper.props('max')).toBe(50)

    wrapper.unmount()
  })

  it('should accept variant prop', () => {
    const wrapper = mount(Slider, {
      props: {
        variant: 'success',
      },
    })

    expect(wrapper.props('variant')).toBe('success')

    wrapper.unmount()
  })

  it('should render thumb element', () => {
    const wrapper = mount(Slider)

    expect(wrapper.find('.pxd-slider--thumb').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should emit change once with the final pointer position', async () => {
    const wrapper = mount(Slider)
    const slider = wrapper.find('.pxd-slider')

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    await slider.trigger('pointerdown', { clientX: 10 })

    expect(wrapper.emitted('update:modelValue')).toEqual([[10]])
    expect(wrapper.emitted('change')).toBeUndefined()

    document.dispatchEvent(new PointerEvent('pointerup', { clientX: 80 }))

    expect(wrapper.emitted('update:modelValue')).toEqual([[10], [80]])
    expect(wrapper.emitted('change')).toEqual([[80]])

    wrapper.unmount()
  })

  it('should reach exactly min when min is not a multiple of step', async () => {
    const wrapper = mount(Slider, {
      props: { min: 5, max: 105, step: 10, modelValue: 55 },
    })
    const slider = wrapper.find('.pxd-slider')

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    // Drag to the far left: the value must land on `min`, not on a multiple of step.
    await slider.trigger('pointerdown', { clientX: 0 })

    expect(wrapper.emitted('update:modelValue')).toEqual([[5]])

    wrapper.unmount()
  })

  it('should snap to the closest value when step is an array', async () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [10, 30, 60, 100], modelValue: 10 },
    })
    const slider = wrapper.find('.pxd-slider')

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    // 50 is 10 away from 60 and 20 away from 30, so the closest value wins.
    await slider.trigger('pointerdown', { clientX: 50 })

    expect(wrapper.emitted('update:modelValue')).toEqual([[60]])

    wrapper.unmount()
  })

  it('should snap ties to the lower value when step is an array', async () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [10, 30, 60, 100], modelValue: 10 },
    })
    const slider = wrapper.find('.pxd-slider')

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    // 40 sits exactly between 30 and 60.
    await slider.trigger('pointerdown', { clientX: 40 })

    expect(wrapper.emitted('update:modelValue')).toEqual([[30]])

    wrapper.unmount()
  })

  it('should ignore unsorted and out of range values in an array step', async () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [80, 0, 20, 150, -10] },
    })
    const slider = wrapper.find('.pxd-slider')

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    await slider.trigger('pointerdown', { clientX: 79 })

    expect(wrapper.emitted('update:modelValue')).toEqual([[80]])

    wrapper.unmount()
  })

  it('should pin the value at min when an array step is empty', async () => {
    const wrapper = mount(Slider, {
      props: { min: 20, max: 100, step: [], modelValue: 20 },
    })
    const slider = wrapper.find('.pxd-slider')

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    // No allowed value is left, so the pointer cannot move the value away from min.
    await slider.trigger('pointerdown', { clientX: 90 })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should move between array values with the arrow keys', async () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [10, 30, 60, 100], modelValue: 30 },
    })
    const thumb = wrapper.find('.pxd-slider--thumb')

    await thumb.trigger('keydown', { code: 'ArrowRight' })
    expect(wrapper.emitted('change')).toEqual([[60]])

    await wrapper.setProps({ modelValue: 60 })
    await thumb.trigger('keydown', { code: 'ArrowRight' })
    expect(wrapper.emitted('change')).toEqual([[60], [100]])

    wrapper.unmount()
  })

  it('should stop at the array bounds when pressing the arrow keys', async () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [10, 30, 60, 100], modelValue: 100 },
    })
    const thumb = wrapper.find('.pxd-slider--thumb')

    await thumb.trigger('keydown', { code: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await thumb.trigger('keydown', { code: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[60]])

    wrapper.unmount()
  })

  it('should step to the next array value from an off-list value', async () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [10, 30, 60, 100], modelValue: 30 },
    })
    const thumb = wrapper.find('.pxd-slider--thumb')

    // A controlled parent can still push a value that is not on the grid.
    await wrapper.setProps({ modelValue: 45 })
    await thumb.trigger('keydown', { code: 'ArrowRight' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[60]])

    await wrapper.setProps({ modelValue: 45 })
    await thumb.trigger('keydown', { code: 'ArrowLeft' })
    expect(wrapper.emitted('update:modelValue')).toEqual([[60], [30]])

    wrapper.unmount()
  })

  it('should snap an off-list initial value on mount', () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [10, 30, 60, 100], modelValue: 50 },
    })

    expect(wrapper.emitted('update:modelValue')).toEqual([[60]])

    wrapper.unmount()
  })

  it('should keep a valid initial value untouched on mount', () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: [10, 30, 60, 100], modelValue: 60 },
    })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should snap both thumbs of a range on mount', () => {
    const wrapper = mount(Slider, {
      props: { range: true, min: 0, max: 100, step: [10, 30, 60, 100], modelValue: [45, 70] },
    })

    expect(wrapper.emitted('update:modelValue')).toEqual([[[30, 60]]])

    wrapper.unmount()
  })

  it('should keep a snapped range ordered on mount', () => {
    const wrapper = mount(Slider, {
      props: { range: true, min: 0, max: 100, step: [10, 30], modelValue: [22, 12] },
    })

    // 22 snaps up to 30 and 12 snaps down to 10, so the pair has to be reordered.
    expect(wrapper.emitted('update:modelValue')).toEqual([[[10, 30]]])

    wrapper.unmount()
  })

  it('should reset the initial value to min when an array step is empty', () => {
    const wrapper = mount(Slider, {
      props: { min: 20, max: 100, step: [], modelValue: 50 },
    })

    expect(wrapper.emitted('update:modelValue')).toEqual([[20]])

    wrapper.unmount()
  })

  it('should not touch the initial value for a numeric step', () => {
    const wrapper = mount(Slider, {
      props: { min: 0, max: 100, step: 5, modelValue: 7 },
    })

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should render a stop for every interior array value', () => {
    const wrapper = mount(Slider, {
      props: { stops: true, min: 0, max: 100, step: [80, 0, 20, 150] },
    })

    expect(wrapper.findAll('.pxd-slider--stop')).toHaveLength(2)

    wrapper.unmount()
  })

  it('should not render stops by default', () => {
    const wrapper = mount(Slider)

    expect(wrapper.findAll('.pxd-slider--stop')).toHaveLength(0)

    wrapper.unmount()
  })

  it('should render a stop for every interior step', () => {
    const wrapper = mount(Slider, {
      props: { stops: true, min: 0, max: 10, step: 5 },
    })

    expect(wrapper.findAll('.pxd-slider--stop')).toHaveLength(1)

    wrapper.unmount()
  })

  it('should drop unreachable trailing stops', () => {
    const wrapper = mount(Slider, {
      props: { stops: true, min: 0, max: 10, step: 3 },
    })

    // 10 is not a multiple of 3, so the last stoppable value is 9.
    expect(wrapper.findAll('.pxd-slider--stop')).toHaveLength(3)

    wrapper.unmount()
  })

  it('should render marks within the slider range only', () => {
    const wrapper = mount(Slider, {
      props: {
        min: 10,
        max: 90,
        marks: { 0: 'Out', 10: 'Low', 50: 'Mid', 90: 'High', 100: 'Out' },
      },
    })

    const marks = wrapper.findAll('.pxd-slider--mark')

    expect(marks.map((mark) => mark.text())).toEqual(['Low', 'Mid', 'High'])

    wrapper.unmount()
  })

  it('should move the value to a clicked mark', async () => {
    const wrapper = mount(Slider, {
      props: { marks: { 0: 'Low', 50: 'Mid', 100: 'High' }, modelValue: 10 },
    })

    await wrapper.findAll('.pxd-slider--mark')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[50]])
    expect(wrapper.emitted('change')).toEqual([[50]])

    wrapper.unmount()
  })

  it('should move the closest thumb when a mark is clicked in range mode', async () => {
    const wrapper = mount(Slider, {
      props: { range: true, marks: { 20: 'Low', 80: 'High' }, modelValue: [10, 90] },
    })

    await wrapper.findAll('.pxd-slider--mark')[1].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[[10, 80]]])

    await wrapper.setProps({ modelValue: [10, 80] })
    await wrapper.findAll('.pxd-slider--mark')[0].trigger('click')

    expect(wrapper.emitted('update:modelValue')).toEqual([[[10, 80]], [[20, 80]]])

    wrapper.unmount()
  })

  it('should ignore mark clicks when disabled', async () => {
    const wrapper = mount(Slider, {
      props: { disabled: true, marks: { 0: 'Low', 100: 'High' }, modelValue: 10 },
    })

    const mark = wrapper.findAll('.pxd-slider--mark')[1]

    expect(mark.attributes('disabled')).toBeDefined()

    await mark.trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should snap positions relative to min', async () => {
    const wrapper = mount(Slider, {
      props: { min: 5, max: 105, step: 10, modelValue: 5 },
    })
    const slider = wrapper.find('.pxd-slider')

    slider.element.getBoundingClientRect = () => ({ left: 0, width: 100 }) as DOMRect

    // 50% of a 100-wide track over [5, 105] is 55, an exact step offset from min.
    await slider.trigger('pointerdown', { clientX: 50 })

    expect(wrapper.emitted('update:modelValue')).toEqual([[55]])

    wrapper.unmount()
  })
})
