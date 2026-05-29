import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import GridItem from '../../src/components/grid-item/index.vue'

describe('grid-item', () => {
  it('renders properly', () => {
    const wrapper = mount(GridItem)

    expect(wrapper.find('.pxd-grid-item').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(GridItem, {
      slots: {
        default: '<span>Item</span>',
      },
    })

    expect(wrapper.text()).toContain('Item')

    wrapper.unmount()
  })

  it('should accept row prop', () => {
    const wrapper = mount(GridItem, {
      props: {
        row: 2,
      },
    })

    expect(wrapper.props('row')).toBe(2)

    wrapper.unmount()
  })

  it('should accept column prop', () => {
    const wrapper = mount(GridItem, {
      props: {
        column: 3,
      },
    })

    expect(wrapper.props('column')).toBe(3)

    wrapper.unmount()
  })
})
