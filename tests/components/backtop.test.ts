import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Backtop from '../../src/components/backtop/index.vue'

describe('backtop', () => {
  it('renders properly', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should set default visibleThreshold', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.props('visibleThreshold')).toBe(30)

    wrapper.unmount()
  })

  it('should set custom visibleThreshold', () => {
    const wrapper = mount(Backtop, {
      props: {
        visibleThreshold: 100,
      },
    })

    expect(wrapper.props('visibleThreshold')).toBe(100)

    wrapper.unmount()
  })

  it('should set appendToBody default', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.props('appendToBody')).toBe(true)

    wrapper.unmount()
  })

  it('should set scrollTarget default', () => {
    const wrapper = mount(Backtop)

    expect(wrapper.props('scrollTarget')).toBe('top')

    wrapper.unmount()
  })
})
