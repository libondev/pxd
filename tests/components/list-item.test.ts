import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import List from '../../src/components/list/index.vue'

describe('list-item', () => {
  it('should be a valid component', async () => {
    const mod = await import('../../src/components/list-item/index.vue')
    expect(mod.default).toBeDefined()
  })

  it('should render default label content', () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item', value: 'item', description: 'Description' }],
      },
    })

    expect(wrapper.text()).toContain('Item')
    expect(wrapper.text()).toContain('Description')

    wrapper.unmount()
  })

  it('should let default slot control item content', () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item', value: 'item' }],
      },
      slots: {
        item: '<span class="custom-icon">Icon</span><span>Custom item</span>',
      },
    })

    expect(wrapper.find('.custom-icon').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom item')
    expect(wrapper.find('.pxd-list-item--content').exists()).toBe(false)

    wrapper.unmount()
  })
})
