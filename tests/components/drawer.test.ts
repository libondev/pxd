import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Drawer from '../../src/components/drawer/index.vue'

describe('drawer', () => {
  it('renders properly', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default modelValue to false', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('modelValue')).toBe(false)

    wrapper.unmount()
  })

  it('should default position to right', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('position')).toBe('right')

    wrapper.unmount()
  })

  it('should accept custom position', () => {
    const wrapper = mount(Drawer, {
      props: {
        position: 'left',
      },
    })

    expect(wrapper.props('position')).toBe('left')

    wrapper.unmount()
  })

  it('should accept title prop', () => {
    const wrapper = mount(Drawer, {
      props: {
        title: 'Drawer Title',
      },
    })

    expect(wrapper.props('title')).toBe('Drawer Title')

    wrapper.unmount()
  })

  it('should accept size prop', () => {
    const wrapper = mount(Drawer, {
      props: {
        size: '400px',
      },
    })

    expect(wrapper.props('size')).toBe('400px')

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to true', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('closeOnPressEscape')).toBe(true)

    wrapper.unmount()
  })

  it('should default closeOnClickOverlay to true', () => {
    const wrapper = mount(Drawer)

    expect(wrapper.props('closeOnClickOverlay')).toBe(true)

    wrapper.unmount()
  })
})
