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
        modelValue: ['1', '3'],
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
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('1')

    wrapper.unmount()
  })

  it('should toggle modelValue in multiple mode', async () => {
    const wrapper = mount(List, {
      props: {
        multiple: true,
        modelValue: ['1'],
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })

    await wrapper.findAll('[data-list-item]')[1].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['1', '2'])

    await wrapper.setProps({ modelValue: ['1', '2'] })
    await wrapper.findAll('[data-list-item]')[0].trigger('click')
    expect(wrapper.emitted('update:modelValue')?.[1]?.[0]).toEqual(['2'])

    wrapper.unmount()
  })
  it('should start from defaultActiveIndex', () => {
    const wrapper = mount(List, {
      props: {
        defaultActiveIndex: 1,
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })

    expect((wrapper.vm as any).activeIndex).toBe(1)

    wrapper.unmount()
  })

  it('should expose focus and move focus to the container', async () => {
    const wrapper = mount(List, {
      attachTo: document.body,
      props: {
        options: [{ label: 'Item 1', value: '1' }],
      },
    })

    ;(wrapper.vm as any).focus()
    await wrapper.vm.$nextTick()

    expect(document.activeElement).toBe(wrapper.element)

    wrapper.unmount()
  })

  it('should expose setActiveIndex and mark the option as selected', async () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })

    ;(wrapper.vm as any).setActiveIndex(1)
    await wrapper.vm.$nextTick()

    const items = wrapper.findAll('[data-list-item]')
    expect(items[0]?.attributes('aria-selected')).toBe('false')
    expect(items[1]?.attributes('aria-selected')).toBe('true')

    wrapper.unmount()
  })

  it('should ignore setActiveIndex for out-of-range and disabled options', () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2', disabled: true },
        ],
      },
    })
    const vm = wrapper.vm as any

    vm.setActiveIndex(0)

    vm.setActiveIndex(99)
    expect(vm.activeIndex).toBe(0)

    vm.setActiveIndex(1)
    expect(vm.activeIndex).toBe(0)

    wrapper.unmount()
  })

  it('should expose setFirstAsActive and skip disabled options', () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1', disabled: true },
          { label: 'Item 2', value: '2' },
        ],
      },
    })

    ;(wrapper.vm as any).setFirstAsActive()

    expect((wrapper.vm as any).activeIndex).toBe(1)

    wrapper.unmount()
  })

  it('should dispatch first and last', () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
          { label: 'Item 3', value: '3' },
        ],
      },
    })
    const vm = wrapper.vm as any

    expect(vm.dispatch('last')).toBe(true)
    expect(vm.activeIndex).toBe(2)

    expect(vm.dispatch('first')).toBe(true)
    expect(vm.activeIndex).toBe(0)

    wrapper.unmount()
  })

  it('should dispatch next and previous while skipping disabled options', () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2', disabled: true },
          { label: 'Item 3', value: '3' },
        ],
      },
    })
    const vm = wrapper.vm as any

    vm.setActiveIndex(0)

    expect(vm.dispatch('next')).toBe(true)
    expect(vm.activeIndex).toBe(2)

    expect(vm.dispatch('previous')).toBe(true)
    expect(vm.activeIndex).toBe(0)

    wrapper.unmount()
  })

  it('should wrap around when loop is enabled', () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
          { label: 'Item 3', value: '3' },
        ],
      },
    })
    const vm = wrapper.vm as any

    vm.setActiveIndex(0)
    expect(vm.dispatch('previous')).toBe(true)
    expect(vm.activeIndex).toBe(2)

    wrapper.unmount()
  })

  it('should stop at the ends when loop is disabled', () => {
    const wrapper = mount(List, {
      props: {
        loop: false,
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })
    const vm = wrapper.vm as any

    vm.setActiveIndex(1)
    expect(vm.dispatch('next')).toBe(false)
    expect(vm.activeIndex).toBe(1)

    vm.setActiveIndex(0)
    expect(vm.dispatch('previous')).toBe(false)
    expect(vm.activeIndex).toBe(0)

    wrapper.unmount()
  })

  it('should dispatch activate and select the active option', async () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })
    const vm = wrapper.vm as any

    expect(vm.dispatch('activate')).toBe(false)

    vm.setActiveIndex(1)
    expect(vm.dispatch('activate')).toBe(true)

    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({ label: 'Item 2', value: '2' })
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('2')

    wrapper.unmount()
  })

  it('should refuse enter-child and leave-parent on the list itself', () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item 1', value: '1' }],
      },
    })
    const vm = wrapper.vm as any

    vm.setActiveIndex(0)

    expect(vm.dispatch('enter-child')).toBe(false)
    expect(vm.dispatch('leave-parent')).toBe(false)

    wrapper.unmount()
  })

  it('should refuse every command when there are no options', () => {
    const wrapper = mount(List, { props: { options: [] } })
    const vm = wrapper.vm as any
    const commands = ['first', 'last', 'next', 'previous', 'activate', 'enter-child', 'leave-parent']

    for (const command of commands) {
      expect(vm.dispatch(command)).toBe(false)
    }

    expect(vm.activeIndex).toBe(-1)

    wrapper.unmount()
  })

  it('should move the active index on pointerover', async () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })

    await wrapper.findAll('[data-list-item]')[1].trigger('pointerover', { pageX: 10, pageY: 20 })

    expect((wrapper.vm as any).activeIndex).toBe(1)

    wrapper.unmount()
  })

  it('should ignore pointerover on a disabled option', async () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2', disabled: true },
        ],
      },
    })

    await wrapper.findAll('[data-list-item]')[0].trigger('pointerover', { pageX: 10, pageY: 20 })
    await wrapper.findAll('[data-list-item]')[1].trigger('pointerover', { pageX: 30, pageY: 40 })

    expect((wrapper.vm as any).activeIndex).toBe(0)

    wrapper.unmount()
  })

  it('should render disabled options with data-disabled', () => {
    const wrapper = mount(List, {
      props: {
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2', disabled: true },
        ],
      },
    })

    const items = wrapper.findAll('[data-list-item]')
    expect(items[0]?.attributes('data-disabled')).toBe('false')
    expect(items[1]?.attributes('data-disabled')).toBe('true')

    wrapper.unmount()
  })

  it('should size the content for the virtual layout', async () => {
    const wrapper = mount(List, {
      props: {
        virtual: true,
        itemSize: 40,
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.pxd-list--content').attributes('style')).toContain('height: 80px')

    wrapper.unmount()
  })
})
