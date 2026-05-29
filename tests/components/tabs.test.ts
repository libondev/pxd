import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Tabs from '../../src/components/tabs/index.vue'

describe('tabs', () => {
  it('renders properly', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '1',
      },
    })

    expect(wrapper.find('.pxd-tabs').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default variant to default', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '1',
      },
    })

    expect(wrapper.props('variant')).toBe('default')

    wrapper.unmount()
  })

  it('should accept custom variant', () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '1',
        variant: 'enclosed',
      },
    })

    expect(wrapper.props('variant')).toBe('enclosed')

    wrapper.unmount()
  })

  it('should emit update:modelValue', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '1',
      },
    })

    wrapper.vm.$emit('update:modelValue', '2')
    expect(wrapper.emitted()).toHaveProperty('update:modelValue')

    wrapper.unmount()
  })
})
