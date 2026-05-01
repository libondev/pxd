import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import ActiveGraph from '../../src/components/active-graph/index.vue'

describe('active-graph', () => {
  it('renders properly', async () => {
    const wrapper = mount(ActiveGraph, {
      props: {
        startDate: '2025-05-01',
        endDate: '2025-05-31',
      },
    })

    expect(
      wrapper.find('table tbody tr:nth-child(5) td:nth-child(2)').attributes('data-date'),
    ).toBe('2025-05-01')

    expect(
      wrapper.find('table tbody tr:nth-child(1) td:nth-child(3)').attributes('data-date'),
    ).toBe('2025-05-04')

    expect(wrapper.find('.pxd-active-graph--legend').exists()).toBe(true)

    wrapper.unmount()
  })

  it('renders properly in transpose mode', async () => {
    const wrapper = mount(ActiveGraph, {
      props: {
        transpose: true,
        startDate: '2025-05-01',
        endDate: '2025-05-31',
      },
    })

    expect(
      wrapper.find('table tbody tr:nth-child(1) td:nth-child(6)').attributes('data-date'),
    ).toBe('2025-05-01')

    expect(
      wrapper.find('table tbody tr:nth-child(2) td:nth-child(2)').attributes('data-date'),
    ).toBe('2025-05-04')

    expect(wrapper.find('.pxd-active-graph--legend').exists()).toBe(true)

    wrapper.unmount()
  })
})
