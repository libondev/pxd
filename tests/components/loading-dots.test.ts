import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import PLoadingDots from '../../src/components/loading-dots/index.vue'

describe('loading-dots', () => {
  it('renders properly', () => {
    const wrapper = mount(PLoadingDots)

    expect(wrapper.findAll('.pxd-loading--dot').length).toBe(3)

    expect(wrapper.find('.pxd-loading-dots--text').exists()).toBe(false)

    wrapper.unmount()
  })
})
