import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Placeholder from '../../src/components/placeholder/index.vue'

describe('placeholder', () => {
  it('renders properly', () => {
    const wrapper = mount(Placeholder)

    expect(wrapper.find('.pxd-placeholder').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Placeholder, {
      slots: {
        default: '<div>Placeholder content</div>',
      },
    })

    expect(wrapper.text()).toContain('Placeholder content')

    wrapper.unmount()
  })

  it('should accept color prop', () => {
    const wrapper = mount(Placeholder, {
      props: {
        color: '#FF0000',
      },
    })

    expect(wrapper.props('color')).toBe('#FF0000')

    wrapper.unmount()
  })
})
