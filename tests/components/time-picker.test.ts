import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import TimePicker from '../../src/components/time-picker/index.vue'

describe('time-picker', () => {
  it('renders properly', () => {
    const wrapper = mount(TimePicker)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render input', () => {
    const wrapper = mount(TimePicker)

    expect(wrapper.find('input').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(TimePicker, {
      props: {
        modelValue: '12:00',
      },
    })

    expect(wrapper.props('modelValue')).toBe('12:00')

    wrapper.unmount()
  })

  it('should accept disabled prop', () => {
    const wrapper = mount(TimePicker, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.props('disabled')).toBe(true)

    wrapper.unmount()
  })
})
