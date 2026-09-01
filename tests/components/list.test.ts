import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { nextTick } from 'vue'
import List from '../../src/components/list/index.vue'

function createViewportRect(top: number): DOMRect {
  const height = 40
  const width = 160

  return {
    x: 0,
    y: top,
    top,
    left: 0,
    right: width,
    bottom: top + height,
    width,
    height,
    toJSON: () => ({}),
  } as DOMRect
}

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

  it('should render custom item slots for nested options', async () => {
    const wrapper = mount(List, {
      attachTo: document.body,
      props: {
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
        item: `<template #item="{ item }"><span class="custom-item">{{ item.label }}</span></template>`,
      },
    })

    await nextTick()
    wrapper.vm.dispatch('next')
    await nextTick()
    await nextTick()
    await nextTick()

    expect(wrapper.findAll('.custom-item')).toHaveLength(1)
    expect(document.body.querySelectorAll('.custom-item')).toHaveLength(2)
    expect(wrapper.text()).toContain('Parent')
    expect(document.body.textContent).toContain('Child')

    const nestedList = document.body.querySelector('.pxd-list--nested')
    expect(nestedList?.parentElement).toBe(document.body)

    wrapper.unmount()
  })

  it('should hide nested panels when their trigger leaves the viewport', async () => {
    const wrapper = mount(List, {
      attachTo: document.body,
      props: {
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
    })

    await nextTick()
    wrapper.vm.dispatch('next')
    await nextTick()
    await nextTick()
    await nextTick()

    const parentItem = wrapper.get('[data-list-item]').element as HTMLElement
    const updateTriggerRect = (top: number) => {
      Object.defineProperty(parentItem, 'getBoundingClientRect', {
        configurable: true,
        value: () => createViewportRect(top),
      })
      window.dispatchEvent(new Event('scroll'))
    }

    try {
      const firstNestedList = document.body.querySelector<HTMLElement>('.pxd-list--nested')!
      await vi.waitFor(() => expect(firstNestedList.style.left).not.toBe(''))

      parentItem.click()
      await vi.waitFor(() =>
        expect(document.body.querySelectorAll('.pxd-list--nested')).toHaveLength(2),
      )

      const nestedLists = document.body.querySelectorAll<HTMLElement>('.pxd-list--nested')
      expect(nestedLists).toHaveLength(2)

      updateTriggerRect(window.innerHeight + 1)
      await vi.waitFor(() => expect(nestedLists[0]?.dataset.referenceHidden).toBe('true'))
      await vi.waitFor(() => expect(nestedLists[1]?.dataset.referenceHidden).toBe('true'))

      expect(nestedLists[0]?.classList).toContain('invisible')
      expect(nestedLists[1]?.classList).toContain('invisible')
    } finally {
      wrapper.unmount()
    }
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

  it('should not select a leaf item with ArrowRight', async () => {
    const wrapper = mount(List, {
      attachTo: document.body,
      props: {
        options: [{ label: 'Leaf', value: 'leaf' }],
      },
    })

    await nextTick()
    wrapper.vm.dispatch('next')
    await nextTick()

    wrapper.vm.dispatch('enter-child')

    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('should navigate nested options without selecting parent items', async () => {
    const wrapper = mount(List, {
      attachTo: document.body,
      props: {
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
    })

    await nextTick()

    const parentItem = wrapper.find('[data-list-item]')

    wrapper.vm.dispatch('next')
    await nextTick()
    await nextTick()
    await nextTick()
    expect(parentItem.attributes('aria-selected')).toBe('true')
    expect(document.body.querySelectorAll('[data-list-item]')).toHaveLength(2)

    await parentItem.trigger('click')
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.vm.dispatch('enter-child')
    await nextTick()
    await nextTick()

    const nestedItems = document.body.querySelectorAll<HTMLElement>('[data-list-item]')
    expect(nestedItems).toHaveLength(3)
    expect(nestedItems[1]?.getAttribute('aria-selected')).toBe('true')

    nestedItems[1]?.click()
    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.vm.dispatch('enter-child')
    await nextTick()
    await nextTick()
    await nextTick()

    const nestedGrandchildItems = document.body.querySelectorAll<HTMLElement>('[data-list-item]')
    expect(nestedGrandchildItems).toHaveLength(3)
    expect(nestedGrandchildItems[2]?.getAttribute('aria-selected')).toBe('true')

    nestedGrandchildItems[2]?.click()
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      label: 'Grandchild',
      value: 'grandchild',
    })

    wrapper.vm.dispatch('leave-parent')
    await nextTick()
    expect(nestedGrandchildItems[1]?.getAttribute('aria-selected')).toBe('true')

    wrapper.vm.dispatch('leave-parent')
    await nextTick()
    expect(parentItem.attributes('aria-selected')).toBe('true')

    wrapper.unmount()
  })
})
