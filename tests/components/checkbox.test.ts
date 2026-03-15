import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Checkbox from '../../src/components/checkbox/index.vue'

describe('checkbox', () => {
  it('renders properly', () => {
    const wrapper = mount(Checkbox)

    expect(wrapper.find('input').exists()).toBe(true)
    expect(wrapper.find('input').attributes('type')).toBe('checkbox')

    wrapper.unmount()
  })

  it('should render a checked checkbox', async () => {
    const wrapper = mount(Checkbox, {
      props: {
        modelValue: true,
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('input').attributes('checked')).toBe('')

    wrapper.unmount()
  })

  it('should render a disabled checkbox', () => {
    const wrapper = mount(Checkbox, {
      props: {
        disabled: true,
      },
    })

    expect(wrapper.find('input').attributes('disabled')).toBe('')

    wrapper.unmount()
  })

  it('should custom value', () => {
    const wrapper = mount(Checkbox, {
      props: {
        value: 'custom-value',
      },
    })

    expect(wrapper.find('input').attributes('value')).toBe('custom-value')

    wrapper.unmount()
  })
})
