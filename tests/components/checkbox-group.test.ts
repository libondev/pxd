import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import CheckboxGroup from '../../src/components/checkbox-group/index.vue'

const options = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
]

describe('checkbox-group', () => {
  it('renders properly', () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        modelValue: [],
      },
    })

    expect(wrapper.classes()).toContain('pxd-checkbox-group')
    expect(wrapper.attributes('role')).toBe('group')
    expect(wrapper.attributes('aria-label')).toBe('Checkbox Group')
    expect(wrapper.attributes('aria-multiselectable')).toBe('true')

    wrapper.unmount()
  })

  it('should render options as checkboxes', () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        options,
        modelValue: [],
      },
    })

    const inputs = wrapper.findAll('input')
    expect(inputs).toHaveLength(2)
    expect(inputs[0].attributes('value')).toBe('a')
    expect(inputs[1].attributes('value')).toBe('b')
    expect(wrapper.text()).toContain('Option A')
    expect(wrapper.text()).toContain('Option B')

    wrapper.unmount()
  })

  it('should render the default slot instead of options', () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        options,
        modelValue: [],
      },
      slots: {
        default: '<span>custom content</span>',
      },
    })

    expect(wrapper.find('input').exists()).toBe(false)
    expect(wrapper.text()).toContain('custom content')

    wrapper.unmount()
  })

  it('should select options included in modelValue', () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        options,
        modelValue: ['a'],
      },
    })

    const inputs = wrapper.findAll('input')
    expect(inputs[0].attributes('checked')).toBe('')
    expect(inputs[1].attributes('checked')).toBeUndefined()

    wrapper.unmount()
  })

  it('should emit update:modelValue and change when unchecking an option', async () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        options,
        modelValue: ['a', 'b'],
      },
    })

    await wrapper.findAll('input')[0].setValue(false)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['b']])
    expect(wrapper.emitted('change')?.[0]).toEqual([['b']])

    wrapper.unmount()
  })

  it('should emit update:modelValue when checking an option', async () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        options,
        modelValue: ['a'],
      },
    })

    await wrapper.findAll('input')[1].setValue(true)

    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([['a', 'b']])

    wrapper.unmount()
  })

  it('should disable all checkboxes when the group is disabled', () => {
    const wrapper = mount(CheckboxGroup, {
      props: {
        options,
        modelValue: [],
        disabled: true,
      },
    })

    for (const input of wrapper.findAll('input')) {
      expect(input.attributes('disabled')).toBe('')
    }

    wrapper.unmount()
  })
})
