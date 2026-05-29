import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import RadioGroup from '../../src/components/radio-group/index.vue'

describe('radio-group', () => {
  it('renders properly', () => {
    const wrapper = mount(RadioGroup)

    expect(wrapper.find('.pxd-radio-group').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should have radiogroup role', () => {
    const wrapper = mount(RadioGroup)

    expect(wrapper.attributes('role')).toBe('radiogroup')

    wrapper.unmount()
  })

  it('should render options from prop', () => {
    const wrapper = mount(RadioGroup, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
    })

    expect(wrapper.text()).toContain('Option 1')
    expect(wrapper.text()).toContain('Option 2')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(RadioGroup, {
      slots: {
        default: '<div>Custom radios</div>',
      },
    })

    expect(wrapper.text()).toContain('Custom radios')

    wrapper.unmount()
  })
})
