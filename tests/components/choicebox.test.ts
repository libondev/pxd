import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Choicebox from '../../src/components/choicebox/index.vue'

describe('choicebox', () => {
  it('renders properly', () => {
    const wrapper = mount(Choicebox)

    expect(wrapper.find('.pxd-choicebox').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should have radiogroup role by default', () => {
    const wrapper = mount(Choicebox)

    expect(wrapper.attributes('role')).toBe('radiogroup')

    wrapper.unmount()
  })

  it('should have group role when multiple', () => {
    const wrapper = mount(Choicebox, {
      props: {
        multiple: true,
      },
    })

    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-multiselectable')).toBe('true')

    wrapper.unmount()
  })

  it('should render options from prop', () => {
    const wrapper = mount(Choicebox, {
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
    const wrapper = mount(Choicebox, {
      slots: {
        default: '<div>Custom items</div>',
      },
    })

    expect(wrapper.text()).toContain('Custom items')

    wrapper.unmount()
  })
})
