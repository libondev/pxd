import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import PinInput from '../../src/components/pin-input/index.vue'

describe('pin-input', () => {
  it('renders properly', () => {
    const wrapper = mount(PinInput)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default 4 inputs', () => {
    const wrapper = mount(PinInput)

    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(4)

    wrapper.unmount()
  })

  it('should render custom length inputs', () => {
    const wrapper = mount(PinInput, {
      props: {
        length: 6,
      },
    })

    const inputs = wrapper.findAll('input')
    expect(inputs.length).toBe(6)

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(PinInput, {
      props: {
        modelValue: '1234',
      },
    })

    expect(wrapper.props('modelValue')).toBe('1234')

    wrapper.unmount()
  })

  it('should accept placeholder prop', () => {
    const wrapper = mount(PinInput, {
      props: {
        placeholder: '*',
      },
    })

    expect(wrapper.props('placeholder')).toBe('*')

    wrapper.unmount()
  })

  it('should accept type prop', () => {
    const wrapper = mount(PinInput, {
      props: {
        type: 'alphanumeric',
      },
    })

    expect(wrapper.props('type')).toBe('alphanumeric')

    wrapper.unmount()
  })
})
