import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Fader from '../../src/components/fader/index.vue'

describe('fader', () => {
  it('renders properly', () => {
    const wrapper = mount(Fader)

    expect(wrapper.attributes('aria-hidden')).toBe('true')

    wrapper.unmount()
  })

  it('should default direction to both', () => {
    const wrapper = mount(Fader)

    expect(wrapper.props('direction')).toBe('both')

    wrapper.unmount()
  })

  it('should accept custom direction', () => {
    const wrapper = mount(Fader, {
      props: {
        direction: 'horizontal',
      },
    })

    expect(wrapper.props('direction')).toBe('horizontal')

    wrapper.unmount()
  })

  it('should accept vertical direction', () => {
    const wrapper = mount(Fader, {
      props: {
        direction: 'vertical',
      },
    })

    expect(wrapper.props('direction')).toBe('vertical')

    wrapper.unmount()
  })
})
