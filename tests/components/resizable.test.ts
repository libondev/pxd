import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Resizable from '../../src/components/resizable/index.vue'

describe('resizable', () => {
  it('renders properly', () => {
    const wrapper = mount(Resizable)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default direction to horizontal', () => {
    const wrapper = mount(Resizable)

    expect(wrapper.props('direction')).toBe('horizontal')

    wrapper.unmount()
  })

  it('should accept vertical direction', () => {
    const wrapper = mount(Resizable, {
      props: {
        direction: 'vertical',
      },
    })

    expect(wrapper.props('direction')).toBe('vertical')

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: '<div>Panel content</div>',
      },
    })

    expect(wrapper.text()).toContain('Panel content')

    wrapper.unmount()
  })
})
