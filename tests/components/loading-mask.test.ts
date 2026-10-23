import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import PLoadingMask from '../../src/components/loading-mask/index.vue'

describe('loading-mask', () => {
  it('renders default text', () => {
    const wrapper = mount(PLoadingMask)

    expect(wrapper.find('.pxd-loading-mask').exists()).toBe(true)
    expect(wrapper.find('.pxd-spinner').exists()).toBe(true)
    expect(wrapper.text()).toBe('Loading...')

    wrapper.unmount()
  })

  it('renders custom text', () => {
    const wrapper = mount(PLoadingMask, { props: { text: 'Fetching...' } })

    expect(wrapper.text()).toBe('Fetching...')

    wrapper.unmount()
  })
})
