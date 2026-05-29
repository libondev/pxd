import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import NumberInput from '../../src/components/number-input/index.vue'

describe('number-input', () => {
  it('renders properly', () => {
    const wrapper = mount(NumberInput)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default step to 1', () => {
    const wrapper = mount(NumberInput)

    expect(wrapper.props('step')).toBe(1)

    wrapper.unmount()
  })

  it('should default controls to true', () => {
    const wrapper = mount(NumberInput)

    expect(wrapper.props('controls')).toBe(true)

    wrapper.unmount()
  })

  it('should accept custom min and max', () => {
    const wrapper = mount(NumberInput, {
      props: {
        min: 0,
        max: 100,
      },
    })

    expect(wrapper.props('min')).toBe(0)
    expect(wrapper.props('max')).toBe(100)

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(NumberInput, {
      props: {
        modelValue: 42,
      },
    })

    expect(wrapper.props('modelValue')).toBe(42)

    wrapper.unmount()
  })

  it('should accept custom step', () => {
    const wrapper = mount(NumberInput, {
      props: {
        step: 5,
      },
    })

    expect(wrapper.props('step')).toBe(5)

    wrapper.unmount()
  })
})
