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
