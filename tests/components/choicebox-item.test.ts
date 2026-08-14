import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Choicebox from '../../src/components/choicebox/index.vue'
import ChoiceboxItem from '../../src/components/choicebox-item/index.vue'

describe('choicebox-item', () => {
  it('renders options and reflects selection', async () => {
    const wrapper = mount(Choicebox, {
      props: {
        modelValue: 'a',
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b' },
        ],
      },
    })

    const items = wrapper.findAllComponents(ChoiceboxItem)
    expect(items).toHaveLength(2)
    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.text()).toContain('Option B')
    expect(items[0]!.attributes('aria-selected')).toBe('true')
    expect(items[1]!.attributes('aria-selected')).toBe('false')

    await items[1]!.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')).toEqual([['b']])

    wrapper.unmount()
  })
})
