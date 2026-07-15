import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import TabsItem from '../../src/components/tabs-item/index.vue'
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
        variant: 'secondary',
      },
    })

    expect(wrapper.props('variant')).toBe('secondary')

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

  it('should render registered items as tabs and panels', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'first',
      },
      slots: {
        default: () => [
          h(TabsItem, { label: 'First', value: 'first' }, () => 'First content'),
          h(TabsItem, { label: 'Second', value: 'second' }, () => 'Second content'),
        ],
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[role="tab"]')).toHaveLength(2)
    expect(wrapper.find('[role="tabpanel"]').text()).toContain('First content')
    expect(wrapper.text()).toContain('First')
    expect(wrapper.text()).toContain('Second')

    wrapper.unmount()
  })

  it('should preserve numeric values and emit change', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 1,
      },
      slots: {
        default: () => [
          h(TabsItem, { label: 'One', value: 1 }, () => 'One content'),
          h(TabsItem, { label: 'Two', value: 2 }, () => 'Two content'),
        ],
      },
    })

    await wrapper.vm.$nextTick()
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)).toEqual([2])
    expect(wrapper.emitted('change')?.at(-1)).toEqual([2])

    wrapper.unmount()
  })
})
