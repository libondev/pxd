import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Modal from '../../src/components/modal/index.vue'

describe('modal', () => {
  it('renders properly', () => {
    const wrapper = mount(Modal)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default modelValue to false', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('modelValue')).toBe(false)

    wrapper.unmount()
  })

  it('should accept width prop', () => {
    const wrapper = mount(Modal, {
      props: {
        width: '600px',
      },
    })

    expect(wrapper.props('width')).toBe('600px')

    wrapper.unmount()
  })

  it('should default closeOnPressEscape to false', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('closeOnPressEscape')).toBe(false)

    wrapper.unmount()
  })

  it('should default closeOnClickOverlay to false', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('closeOnClickOverlay')).toBe(false)

    wrapper.unmount()
  })

  it('should default defaultFooterStyle to true', () => {
    const wrapper = mount(Modal)

    expect(wrapper.props('defaultFooterStyle')).toBe(true)

    wrapper.unmount()
  })

  it('should accept zIndex prop', () => {
    const wrapper = mount(Modal, {
      props: {
        zIndex: 9999,
      },
    })

    expect(wrapper.props('zIndex')).toBe(9999)

    wrapper.unmount()
  })
})
