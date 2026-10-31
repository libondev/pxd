import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, markRaw } from 'vue'
import List from '../../src/components/list/index.vue'

const TestIcon = markRaw({
  render: () => h('svg', { class: 'test-icon' }),
})

describe('list-item', () => {
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

  it('should render option icon next to the default content', () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item', value: 'item', icon: TestIcon }],
      },
    })

    expect(wrapper.find('.test-icon').exists()).toBe(true)
    expect(wrapper.find('.pxd-list-item--content').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should keep the icon when the item slot replaces the content', () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item', value: 'item', icon: TestIcon }],
      },
      slots: {
        item: '<span>Custom item</span>',
      },
    })

    expect(wrapper.find('.test-icon').exists()).toBe(true)
    expect(wrapper.text()).toContain('Custom item')

    wrapper.unmount()
  })

  it('should not render an icon without the icon option', () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item', value: 'item' }],
      },
    })

    expect(wrapper.find('.pxd-list-item--icon').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should not forward the icon into the change payload', async () => {
    const wrapper = mount(List, {
      props: {
        options: [{ label: 'Item', value: 'item', icon: TestIcon }],
      },
    })

    await wrapper.find('[data-list-item]').trigger('click')

    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({ label: 'Item', value: 'item' })

    wrapper.unmount()
  })
})
