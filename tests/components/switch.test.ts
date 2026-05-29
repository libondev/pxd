import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Switch from '../../src/components/switch/index.vue'

describe('switch', () => {
  it('renders properly', () => {
    const wrapper = mount(Switch)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render options from prop', () => {
    const wrapper = mount(Switch, {
      props: {
        options: [
          { label: 'Tab 1', value: '1' },
          { label: 'Tab 2', value: '2' },
        ],
      },
    })

    expect(wrapper.text()).toContain('Tab 1')
    expect(wrapper.text()).toContain('Tab 2')

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(Switch, {
      props: {
        modelValue: '1',
        options: [
          { label: 'Tab 1', value: '1' },
          { label: 'Tab 2', value: '2' },
        ],
      },
    })

    expect(wrapper.props('modelValue')).toBe('1')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Switch, {
      slots: {
        default: '<div>Custom switch items</div>',
      },
    })

    expect(wrapper.text()).toContain('Custom switch items')

    wrapper.unmount()
  })

  it('should accept fullWidth prop', () => {
    const wrapper = mount(Switch, {
      props: {
        fullWidth: true,
      },
    })

    expect(wrapper.props('fullWidth')).toBe(true)

    wrapper.unmount()
  })
})
