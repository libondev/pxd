import type { TabsItemProps } from '../../src/components/tabs-item/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import TabsItem from '../../src/components/tabs-item/index.vue'
import Tabs from '../../src/components/tabs/index.vue'

function mountTabsItem(props: TabsItemProps) {
  return mount(Tabs, {
    slots: {
      default: () => h(TabsItem, props),
    },
  })
}

describe('tabs-item', () => {
  it('renders properly', () => {
    const wrapper = mountTabsItem({
      label: 'Tab 1',
      value: '1',
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept label prop', () => {
    const wrapper = mountTabsItem({
      label: 'My Tab',
      value: '1',
    })

    expect(wrapper.findComponent(TabsItem).props('label')).toBe('My Tab')

    wrapper.unmount()
  })

  it('should accept value prop', () => {
    const wrapper = mountTabsItem({
      label: 'Tab',
      value: 'tab-value',
    })

    expect(wrapper.findComponent(TabsItem).props('value')).toBe('tab-value')

    wrapper.unmount()
  })

  it('should accept disabled prop', () => {
    const wrapper = mountTabsItem({
      label: 'Tab',
      value: '1',
      disabled: true,
    })

    expect(wrapper.findComponent(TabsItem).props('disabled')).toBe(true)

    wrapper.unmount()
  })
})
