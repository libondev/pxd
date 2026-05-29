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

  it('should default loop to true', () => {
    const wrapper = mount(List)

    expect(wrapper.props('loop')).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(List, {
      slots: {
        default: '<li>Custom item</li>',
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
    expect(wrapper.emitted()).toHaveProperty('select')

    wrapper.unmount()
  })
})
