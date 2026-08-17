import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import SwitchItem from '../../src/components/switch-item/index.vue'
import Switch from '../../src/components/switch/index.vue'

const options = [
  { label: 'Tab 1', value: '1' },
  { label: 'Tab 2', value: '2' },
]

describe('switch-item', () => {
  it('renders options and updates the group model', async () => {
    const wrapper = mount(Switch, {
      props: {
        modelValue: '1',
        options,
      },
    })

    const items = wrapper.findAllComponents(SwitchItem)
    expect(items).toHaveLength(2)
    expect(wrapper.text()).toContain('Tab 1')
    expect(wrapper.text()).toContain('Tab 2')
    expect(items[0]!.attributes('aria-selected')).toBe('true')
    expect(items[1]!.attributes('aria-selected')).toBe('false')

    await items[1]!.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['2']])

    wrapper.unmount()
  })

  it('should render radio inputs reflecting the group model', () => {
    const wrapper = mount(Switch, {
      props: {
        modelValue: '1',
        options,
      },
    })

    const items = wrapper.findAllComponents(SwitchItem)
    expect(items[0]!.find('input').attributes('type')).toBe('radio')
    expect(items[0]!.find('input').attributes('checked')).toBe('')
    expect(items[1]!.find('input').attributes('checked')).toBeUndefined()
    expect(items[0]!.attributes('role')).toBe('switch')

    wrapper.unmount()
  })

  it('should disable all items when the group is disabled', () => {
    const wrapper = mount(Switch, {
      props: {
        disabled: true,
        options,
      },
    })

    for (const item of wrapper.findAllComponents(SwitchItem)) {
      expect(item.find('input').attributes('disabled')).toBe('')
    }

    wrapper.unmount()
  })

  it('should disable a single item via options', () => {
    const wrapper = mount(Switch, {
      props: {
        options: [
          { label: 'Tab 1', value: '1' },
          { label: 'Tab 2', value: '2', disabled: true },
        ],
      },
    })

    const items = wrapper.findAllComponents(SwitchItem)
    expect(items[0]!.find('input').attributes('disabled')).toBeUndefined()
    expect(items[1]!.find('input').attributes('disabled')).toBe('')
    expect(items[1]!.attributes('data-disabled')).toBe('true')

    wrapper.unmount()
  })

  it('should select an item on focus', async () => {
    const wrapper = mount(Switch, {
      props: {
        modelValue: '1',
        options,
      },
    })

    const items = wrapper.findAllComponents(SwitchItem)
    await items[1]!.find('.pxd-switch-item--label').trigger('focusin')

    expect(wrapper.emitted('update:modelValue')).toEqual([['2']])

    wrapper.unmount()
  })

  it('should render the default slot label', () => {
    const wrapper = mount(Switch, {
      slots: {
        default: () => h(SwitchItem, { value: '1' }, () => 'Custom Label'),
      },
    })

    expect(wrapper.text()).toContain('Custom Label')

    wrapper.unmount()
  })
})
