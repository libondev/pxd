import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import SplitButton from '../../src/components/split-button/index.vue'

describe('split-button', () => {
  it('renders properly', () => {
    const wrapper = mount(SplitButton)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept options prop', () => {
    const wrapper = mount(SplitButton, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
    })

    expect(wrapper.props('options')).toHaveLength(2)

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(SplitButton, {
      props: {
        modelValue: '1',
      },
    })

    expect(wrapper.props('modelValue')).toBe('1')

    wrapper.unmount()
  })
})
