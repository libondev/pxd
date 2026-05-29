import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Radio from '../../src/components/radio/index.vue'

describe('radio', () => {
  it('renders properly', () => {
    const wrapper = mount(Radio, {
      props: {
        value: 'option1',
      },
    })

    expect(wrapper.find('input[type="radio"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render label', () => {
    const wrapper = mount(Radio, {
      props: {
        value: 'option1',
        label: 'Option 1',
      },
    })

    expect(wrapper.text()).toContain('Option 1')

    wrapper.unmount()
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(Radio, {
      props: {
        value: 'option1',
        disabled: true,
      },
    })

    expect(wrapper.find('input').attributes('disabled')).toBe('')

    wrapper.unmount()
  })
})
