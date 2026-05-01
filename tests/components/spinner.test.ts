import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import PSpinner from '../../src/components/spinner/index.vue'

describe('spinner', () => {
  it('renders properly', () => {
    const wrapper = mount(PSpinner)
    expect(wrapper.exists()).toBe(true)
    expect(wrapper.find('.pxd-spinner').exists()).toBe(true)

    wrapper.unmount()
  })

  it('each spinner item has correct styles', () => {
    const wrapper = mount(PSpinner)
    const items = wrapper.findAll('.pxd-spinner-item')

    items.forEach((item, index) => {
      const i = index + 1
      const opacityValue = i * (1 / 12)
      const rotateValue = i * (360 / 12)

      expect(item.attributes('style')).toContain(`opacity: ${opacityValue}`)
      expect(item.attributes('style')).toContain(
        `transform: rotate(${rotateValue}deg) translate(146%)`,
      )
    })

    wrapper.unmount()
  })
})
