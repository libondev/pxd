import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { nextTick } from 'vue'
import Menu from '../../src/components/menu/index.vue'

async function flushPopover() {
  await new Promise((resolve) => setTimeout(resolve, 0))
  await nextTick()
  await new Promise(requestAnimationFrame)
  await new Promise(requestAnimationFrame)
  await Promise.resolve()
}

describe('menu', () => {
  it('renders properly', () => {
    const wrapper = mount(Menu, {
      slots: {
        trigger: '<button>Open Menu</button>',
      },
    })

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept options prop', () => {
    const wrapper = mount(Menu, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        trigger: '<button>Open</button>',
      },
    })

    expect(wrapper.props('options')).toHaveLength(2)

    wrapper.unmount()
  })

  it('should default position to bottom-start', () => {
    const wrapper = mount(Menu, {
      slots: {
        trigger: '<button>Open</button>',
      },
    })

    expect(wrapper.props('position')).toBe('bottom-start')

    wrapper.unmount()
  })

  it('should render custom item slot from options', async () => {
    const wrapper = mount(Menu, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        default: '<button>Open</button>',
        item: `<template #item="{ item }">Custom {{ item.label }}</template>`,
      },
    })

    await wrapper.find('button').trigger('click')
    await new Promise((resolve) => setTimeout(resolve, 50))

    expect(document.body.textContent).toContain('Custom Option 1')
    expect(document.body.textContent).toContain('Custom Option 2')

    wrapper.unmount()
  })

  it('should focus the list when opened', async () => {
    const wrapper = mount(Menu, {
      props: {
        options: [{ label: 'Option 1', value: '1' }],
      },
      slots: {
        default: '<button>Open</button>',
      },
    })

    await wrapper.find('button').trigger('click')
    await flushPopover()

    expect(document.activeElement).toBe(document.body.querySelector('.pxd-list'))

    wrapper.unmount()
  })

  it('should navigate list items with ArrowDown after opening', async () => {
    const wrapper = mount(Menu, {
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        default: '<button>Open</button>',
      },
    })

    await wrapper.find('button').trigger('click')
    await flushPopover()

    const popoverWrapper = document.body.querySelector<HTMLElement>(
      '.pxd-popover--wrapper[data-visible="true"]',
    )!
    const items = popoverWrapper.querySelectorAll<HTMLElement>('[data-list-item]')

    popoverWrapper.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    )
    await nextTick()
    expect(items[0]?.getAttribute('aria-selected')).toBe('true')

    popoverWrapper.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    )
    await nextTick()

    expect(items[1]?.getAttribute('aria-selected')).toBe('true')

    wrapper.unmount()
  })

  it('should navigate from the active menu without list focus', async () => {
    const wrapper = mount(Menu, {
      attachTo: document.body,
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        default: '<button>Open</button>',
      },
    })

    await wrapper.find('button').trigger('click')
    await flushPopover()

    const items = document.body.querySelectorAll<HTMLElement>('[data-list-item]')
    const popoverWrapper = document.body.querySelector<HTMLElement>('.pxd-popover--wrapper')!
    popoverWrapper.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    )
    await nextTick()

    expect(items[0]?.getAttribute('aria-selected')).toBe('true')

    wrapper.unmount()
  })

  it('should activate the current item with Space', async () => {
    const wrapper = mount(Menu, {
      attachTo: document.body,
      props: {
        options: [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' },
        ],
      },
      slots: {
        default: '<button>Open</button>',
      },
    })

    await wrapper.find('button').trigger('click')
    await flushPopover()

    const popoverWrapper = document.body.querySelector<HTMLElement>(
      '.pxd-popover--wrapper[data-visible="true"]',
    )!
    popoverWrapper.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    )
    await nextTick()
    popoverWrapper.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    )
    await nextTick()
    popoverWrapper.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }))
    await nextTick()

    expect(wrapper.emitted('select')?.[0]?.[0]).toEqual({ label: 'Option 2', value: '2' })

    wrapper.unmount()
  })

  it('should scope keyboard navigation to the active popover wrapper', async () => {
    const firstMenu = mount(Menu, {
      attachTo: document.body,
      props: {
        options: [
          { label: 'First 1', value: 'first-1' },
          { label: 'First 2', value: 'first-2' },
        ],
      },
      slots: {
        default: '<button>First</button>',
      },
    })
    const secondMenu = mount(Menu, {
      attachTo: document.body,
      props: {
        options: [
          { label: 'Second 1', value: 'second-1' },
          { label: 'Second 2', value: 'second-2' },
        ],
      },
      slots: {
        default: '<button>Second</button>',
      },
    })

    await firstMenu.find('button').trigger('click')
    await secondMenu.find('button').trigger('click')
    await flushPopover()

    const popoverWrappers = document.body.querySelectorAll<HTMLElement>(
      '.pxd-popover--wrapper[data-visible="true"]',
    )
    const firstItems = popoverWrappers[0]?.querySelectorAll<HTMLElement>('[data-list-item]')
    const secondItems = popoverWrappers[1]?.querySelectorAll<HTMLElement>('[data-list-item]')

    popoverWrappers[0]?.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowDown', cancelable: true }),
    )
    await nextTick()

    expect(firstItems?.[0]?.getAttribute('aria-selected')).toBe('true')
    expect(firstItems?.[1]?.getAttribute('aria-selected')).toBe('false')
    expect(secondItems?.[0]?.getAttribute('aria-selected')).toBe('false')
    expect(secondItems?.[1]?.getAttribute('aria-selected')).toBe('false')

    firstMenu.unmount()
    secondMenu.unmount()
  })
})
