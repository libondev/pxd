import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import List from '../../src/components/list/index.vue'

describe('list', () => {
  it('renders properly', () => {
    const wrapper = mount(List)

    expect(wrapper.find('.pxd-list').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render options from prop', () => {
    const wrapper = mount(List, {
      attachTo: document.body,
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })

    expect(wrapper.text()).toContain('Item 1')
    expect(wrapper.text()).toContain('Item 2')

    wrapper.unmount()
  })

  it('should mark matching values as checked', () => {
    const wrapper = mount(List, {
      props: {
        value: ['1', '3'],
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
          { label: 'Item 3', value: '3' },
        ],
      },
    })

    const items = wrapper.findAll('[data-list-item]')
    expect(items[0]?.attributes('data-checked')).toBe('true')
    expect(items[1]?.attributes('data-checked')).toBe('false')
    expect(items[2]?.attributes('data-checked')).toBe('true')

    wrapper.unmount()
  })

  it('should set aria-multiselectable when multiple', () => {
    const wrapper = mount(List, {
      props: {
        multiple: true,
      },
    })

    expect(wrapper.find('.pxd-list').attributes('aria-multiselectable')).toBe('true')

    wrapper.unmount()
  })

  it('should render grouped options from prop', () => {
    const wrapper = mount(List, {
      props: {
        options: [
          {
            type: 'group',
            label: 'Group 1',
            options: [
              { label: 'Item 1', value: '1' },
              { label: 'Item 2', value: '2' },
            ],
          },
        ],
      },
    })

    expect(wrapper.text()).toContain('Group 1')
    expect(wrapper.text()).toContain('Item 1')
    expect(wrapper.text()).toContain('Item 2')

    wrapper.unmount()
  })

  it('should default loop to true', () => {
    const wrapper = mount(List)

    expect(wrapper.props('loop')).toBe(true)

    wrapper.unmount()
  })

  it('should render custom item slot', () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Custom item', value: '1' }],
      },
      slots: {
        item: `<template #item="{ item }">{{ item.label }}</template>`,
      },
    })

    expect(wrapper.text()).toContain('Custom item')

    wrapper.unmount()
  })

  it('should emit select event', async () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item 1', value: '1' }],
      },
    })

    const items = wrapper.findAll('[data-list-item]')
    expect(items.length).toBeGreaterThan(0)

    await items[0].trigger('click')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({ label: 'Item 1', value: '1' })

    wrapper.unmount()
  })
})
