import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import ChoiceboxItem from '../../src/components/choicebox-item/index.vue'
import Choicebox from '../../src/components/choicebox/index.vue'

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
]

describe('choicebox-item', () => {
  it('renders options and reflects selection', async () => {
    const wrapper = mount(Choicebox, {
      props: {
        modelValue: 'a',
        options,
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

  it('should toggle selection in multiple mode', async () => {
    const wrapper = mount(Choicebox, {
      props: {
        multiple: true,
        modelValue: ['a'],
        options,
      },
    })

    const items = wrapper.findAllComponents(ChoiceboxItem)
    expect(items[0]!.attributes('role')).toBe('checkbox')
    expect(items[0]!.attributes('aria-selected')).toBe('true')

    await items[0]!.find('input').setValue(false)
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([[]])

    await items[1]!.find('input').setValue(true)
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([['a', 'b']])

    wrapper.unmount()
  })

  it('should disable all items when the group is disabled', () => {
    const wrapper = mount(Choicebox, {
      props: {
        disabled: true,
        options,
      },
    })

    for (const item of wrapper.findAllComponents(ChoiceboxItem)) {
      expect(item.find('input').attributes('disabled')).toBe('')
    }

    wrapper.unmount()
  })

  it('should disable a single item via options', () => {
    const wrapper = mount(Choicebox, {
      props: {
        options: [
          { label: 'Option A', value: 'a' },
          { label: 'Option B', value: 'b', disabled: true },
        ],
      },
    })

    const inputs = wrapper.findAll('input')
    expect(inputs[0]!.attributes('disabled')).toBeUndefined()
    expect(inputs[1]!.attributes('disabled')).toBe('')

    wrapper.unmount()
  })

  it('should render label, description and default slots', () => {
    const wrapper = mount(Choicebox, {
      props: {
        modelValue: 'a',
      },
      slots: {
        default: () =>
          h(
            ChoiceboxItem,
            { value: 'a' },
            {
              label: () => 'Slot Label',
              description: () => 'Slot Description',
              default: () => 'Extra Content',
            },
          ),
      },
    })

    const item = wrapper.findComponent(ChoiceboxItem)
    expect(item.find('.pxd-choicebox-item--label').text()).toBe('Slot Label')
    expect(item.find('.pxd-choicebox-item--description').text()).toBe('Slot Description')
    expect(item.find('.pxd-choicebox-item--content').text()).toBe('Extra Content')

    wrapper.unmount()
  })

  it('should hide the default slot content when unselected', () => {
    const wrapper = mount(Choicebox, {
      props: {
        modelValue: 'b',
      },
      slots: {
        default: () => h(ChoiceboxItem, { value: 'a' }, { default: () => 'Extra Content' }),
      },
    })

    const content = wrapper.findComponent(ChoiceboxItem).find('.pxd-choicebox-item--content')
    expect(content.exists()).toBe(true)
    expect(content.attributes('style')).toContain('display: none')

    wrapper.unmount()
  })
})
