import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Marquee from '../../src/components/marquee/index.vue'

describe('marquee', () => {
  it('renders properly', () => {
    const wrapper = mount(Marquee)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Marquee, {
      slots: {
        default: '<span>Scrolling text</span>',
      },
    })

    expect(wrapper.text()).toContain('Scrolling text')

    wrapper.unmount()
  })
})
