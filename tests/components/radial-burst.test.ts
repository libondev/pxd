import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import RadialBurst from '../../src/components/radial-burst/index.vue'

describe('radial-burst', () => {
  it('renders properly', () => {
    const wrapper = mount(RadialBurst, {
      slots: {
        default: 'burst content',
      },
    })

    expect(wrapper.classes()).toContain('pxd-radial-burst')
    expect(wrapper.find('.pxd-radial-burst--container').exists()).toBe(true)
    expect(wrapper.find('.pxd-radial-burst--content').text()).toBe('burst content')

    wrapper.unmount()
  })

  it('should apply a custom size and primary color', () => {
    const wrapper = mount(RadialBurst, {
      props: {
        size: 200,
        primaryColor: '#ff0000',
      },
    })

    const container = wrapper.find('.pxd-radial-burst--container')
    expect(container.attributes('style')).toContain('inline-size: 200px')
    expect(container.attributes('style')).toContain('--radial-burst-color-accent: #ff0000')

    wrapper.unmount()
  })

  it('should apply a custom background color', () => {
    const wrapper = mount(RadialBurst, {
      props: {
        backgroundColor: 'red',
      },
    })

    expect(wrapper.attributes('style')).toContain('background-color: red')

    wrapper.unmount()
  })
})
