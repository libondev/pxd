import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import LoadingBar from '../../src/components/loading-bar/index.vue'

describe('loading-bar', () => {
  it('renders properly', () => {
    const wrapper = mount(LoadingBar)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default group to default', () => {
    const wrapper = mount(LoadingBar)

    expect(wrapper.props('group')).toBe('default')

    wrapper.unmount()
  })

  it('should accept custom group', () => {
    const wrapper = mount(LoadingBar, {
      props: {
        group: 'custom',
      },
    })

    expect(wrapper.props('group')).toBe('custom')

    wrapper.unmount()
  })

  it('should default trickle to true', () => {
    const wrapper = mount(LoadingBar)

    expect(wrapper.props('trickle')).toBe(true)

    wrapper.unmount()
  })
})
