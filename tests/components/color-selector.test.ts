import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ColorSelector from '../../src/components/color-selector/index.vue'

describe('color-selector', () => {
  it('renders properly', () => {
    const wrapper = mount(ColorSelector)

    expect(wrapper.find('[role="tabpanel"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default colors', () => {
    const wrapper = mount(ColorSelector)

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios.length).toBe(5)

    wrapper.unmount()
  })

  it('should render custom colors', () => {
    const wrapper = mount(ColorSelector, {
      props: {
        colors: ['#FF0000', '#00FF00'],
      },
    })

    const radios = wrapper.findAll('input[type="radio"]')
    expect(radios.length).toBe(2)

    wrapper.unmount()
  })

  it('should emit update:modelValue on select', async () => {
    const wrapper = mount(ColorSelector)

    const radio = wrapper.find('input[type="radio"]')
    await radio.setValue()

    expect(wrapper.emitted()).toHaveProperty('update:modelValue')

    wrapper.unmount()
  })
})
