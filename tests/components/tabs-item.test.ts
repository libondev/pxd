import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import TabsItem from '../../src/components/tabs-item/index.vue'

describe('tabs-item', () => {
  it('renders properly', () => {
    const wrapper = mount(TabsItem, {
      props: {
        label: 'Tab 1',
        value: '1',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept label prop', () => {
    const wrapper = mount(TabsItem, {
      props: {
        label: 'My Tab',
        value: '1',
      },
    })

    expect(wrapper.props('label')).toBe('My Tab')

    wrapper.unmount()
  })

  it('should accept value prop', () => {
    const wrapper = mount(TabsItem, {
      props: {
        label: 'Tab',
        value: 'tab-value',
      },
    })

    expect(wrapper.props('value')).toBe('tab-value')

    wrapper.unmount()
  })

  it('should accept disabled prop', () => {
    const wrapper = mount(TabsItem, {
      props: {
        label: 'Tab',
        value: '1',
        disabled: true,
      },
    })

    expect(wrapper.props('disabled')).toBe(true)

    wrapper.unmount()
  })
})
