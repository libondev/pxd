import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ToggleButtonGroup from '../../src/components/toggle-button-group/index.vue'

describe('toggle-button-group', () => {
  it('renders properly', () => {
    const wrapper = mount(ToggleButtonGroup)

    expect(wrapper.find('.pxd-toggle-button-group').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default gap to 0', () => {
    const wrapper = mount(ToggleButtonGroup)

    expect(wrapper.props('gap')).toBe(0)

    wrapper.unmount()
  })

  it('should default multiple to true', () => {
    const wrapper = mount(ToggleButtonGroup)

    expect(wrapper.props('multiple')).toBe(true)

    wrapper.unmount()
  })

  it('should render options from prop', () => {
    const wrapper = mount(ToggleButtonGroup, {
      props: {
        options: [
          { label: 'A', value: 'a' },
          { label: 'B', value: 'b' },
        ],
      },
    })

    expect(wrapper.text()).toContain('A')
    expect(wrapper.text()).toContain('B')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(ToggleButtonGroup, {
      slots: {
        default: '<button>Custom</button>',
      },
    })

    expect(wrapper.text()).toContain('Custom')

    wrapper.unmount()
  })

  it('should accept custom gap', () => {
    const wrapper = mount(ToggleButtonGroup, {
      props: {
        gap: 2,
      },
    })

    expect(wrapper.props('gap')).toBe(2)

    wrapper.unmount()
  })
})
