import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Checkerboard from '../../src/components/checkerboard/index.vue'

describe('checkerboard', () => {
  it('renders properly', () => {
    const wrapper = mount(Checkerboard, {
      slots: {
        default: 'content',
      },
    })

    expect(wrapper.classes()).toContain('pxd-checkerboard')
    expect(wrapper.text()).toBe('content')

    wrapper.unmount()
  })

  it('should apply a custom size', () => {
    const wrapper = mount(Checkerboard, {
      props: {
        size: 32,
      },
    })
    expect(wrapper.attributes('style')).toContain('--checkerboard-size: 32px')
    wrapper.unmount()

    const remWrapper = mount(Checkerboard, {
      props: {
        size: '2rem',
      },
    })
    expect(remWrapper.attributes('style')).toContain('--checkerboard-size: 2rem')
    remWrapper.unmount()
  })

  it('should apply custom colors', () => {
    const wrapper = mount(Checkerboard, {
      props: {
        primaryColor: '#ff0000',
        backgroundColor: '#00ff00',
      },
    })

    expect(wrapper.attributes('style')).toContain('--checkerboard-primary-color: #ff0000')
    expect(wrapper.attributes('style')).toContain('--checkerboard-background-color: #00ff00')

    wrapper.unmount()
  })
})
