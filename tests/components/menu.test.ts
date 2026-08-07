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
})
