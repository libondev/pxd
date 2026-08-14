import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Switch from '../../src/components/switch/index.vue'
import SwitchItem from '../../src/components/switch-item/index.vue'

describe('switch-item', () => {
  it('renders options and updates the group model', async () => {
    const wrapper = mount(Switch, {
      props: {
        modelValue: '1',
        options: [
          { label: 'Tab 1', value: '1' },
          { label: 'Tab 2', value: '2' },
        ],
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
})
