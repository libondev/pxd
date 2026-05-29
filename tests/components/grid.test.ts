import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import Grid from '../../src/components/grid/index.vue'

describe('grid', () => {
  it('renders properly', () => {
    const wrapper = mount(Grid)

    expect(wrapper.find('.pxd-grid').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should render default slot', () => {
    const wrapper = mount(Grid, {
      slots: {
        default: '<div>Grid item</div>',
      },
    })

    expect(wrapper.text()).toContain('Grid item')

    wrapper.unmount()
  })

  it('should accept numeric columns', () => {
    const wrapper = mount(Grid, {
      props: {
        columns: 3,
      },
    })

    expect(wrapper.props('columns')).toBe(3)

    wrapper.unmount()
  })

  it('should accept responsive columns object', () => {
    const wrapper = mount(Grid, {
      props: {
        columns: { xs: 1, sm: 2, md: 3 },
      },
    })

    expect(wrapper.props('columns')).toEqual({ xs: 1, sm: 2, md: 3 })

    wrapper.unmount()
  })
})
