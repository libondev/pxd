import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import SplitButton from '../../src/components/split-button/index.vue'

describe('split-button', () => {
  it('renders properly', () => {
    const wrapper = mount(SplitButton)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept options prop', () => {
    const wrapper = mount(SplitButton, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
    })

    expect(wrapper.props('options')).toHaveLength(2)

    wrapper.unmount()
  })

  it('should accept modelValue', () => {
    const wrapper = mount(SplitButton, {
      props: {
        modelValue: '1',
      },
    })

    expect(wrapper.props('modelValue')).toBe('1')

    wrapper.unmount()
  })

  it('should render selected data from options', () => {
    const wrapper = mount(SplitButton, {
      props: {
        modelValue: '2',
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        default: `<template #default="{ data }">{{ data?.label }}</template>`,
      },
    })

    expect(wrapper.text()).toContain('Option 2')

    wrapper.unmount()
  })

  it('should render selected data from grouped options', () => {
    const wrapper = mount(SplitButton, {
      props: {
        modelValue: '2',
        options: [
          {
            type: 'group',
            label: 'Group',
            options: [
              { label: 'Option 1', value: '1' },
              { label: 'Option 2', value: '2' },
            ],
          },
        ],
      },
      slots: {
        default: `<template #default="{ data }">{{ data?.label }}</template>`,
      },
    })

    expect(wrapper.text()).toContain('Option 2')

    wrapper.unmount()
  })

  it('should render selected data from nested options', () => {
    const wrapper = mount(SplitButton, {
      props: {
        modelValue: 'grandchild',
        options: [
          {
            label: 'Parent',
            value: 'parent',
            children: [
              {
                label: 'Child',
                value: 'child',
                children: [{ label: 'Grandchild', value: 'grandchild' }],
              },
            ],
          },
        ],
      },
      slots: {
        default: `<template #default="{ data }">{{ data?.label }}</template>`,
      },
    })

    expect(wrapper.text()).toContain('Grandchild')

    wrapper.unmount()
  })

  it('should render custom item slot from options', async () => {
    const wrapper = mount(SplitButton, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        item: `<template #item="{ item }">Custom {{ item.label }}</template>`,
      },
    })

    await wrapper.findAll('button')[1].trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(document.body.textContent).toContain('Custom Option 1')
    expect(document.body.textContent).toContain('Custom Option 2')

    wrapper.unmount()
  })

  it('should update model only once when selecting an option', async () => {
    const wrapper = mount(SplitButton, {
      props: {
        options: [{ label: 'Option 1', value: '1' }],
      },
    })

    await wrapper.findAll('button')[1]?.trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))

    document.body.querySelector<HTMLElement>('[data-list-item]')?.click()

    expect(wrapper.emitted('change')).toHaveLength(1)
    expect(wrapper.emitted('update:modelValue')).toHaveLength(1)
    expect(wrapper.emitted('select')).toHaveLength(1)

    wrapper.unmount()
  })
})
