import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ToggleButton from '../../src/components/toggle-button/index.vue'

describe('toggle-button', () => {
  it('renders properly', () => {
    const wrapper = mount(ToggleButton, {
      slots: {
        default: 'Toggle',
      },
    })

    expect(wrapper.find('.pxd-toggle-button').exists()).toBe(true)
    expect(wrapper.text()).toContain('Toggle')

    wrapper.unmount()
  })

  it('should render as button', () => {
    const wrapper = mount(ToggleButton, {
      slots: {
        default: 'Click',
      },
    })

    expect(wrapper.element.tagName).toBe('BUTTON')

    wrapper.unmount()
  })

  it('should default value to true', () => {
    const wrapper = mount(ToggleButton)

    expect(wrapper.props('value')).toBe(true)

    wrapper.unmount()
  })

  it('should accept custom value', () => {
    const wrapper = mount(ToggleButton, {
      props: {
        value: 'custom',
      },
    })

    expect(wrapper.props('value')).toBe('custom')

    wrapper.unmount()
  })

  it('should be disabled when disabled prop is true', () => {
    const wrapper = mount(ToggleButton, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.attributes('disabled')).toBe('')

    wrapper.unmount()
  })
})
