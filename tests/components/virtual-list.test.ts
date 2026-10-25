import type { TocScrollSource } from '../../src/components/toc/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import VirtualList from '../../src/components/virtual-list/index.vue'

describe('virtual-list', () => {
  it('renders properly', () => {
    const wrapper = mount(VirtualList)

    expect(wrapper.exists()).toBe(true)

    wrapper.unmount()
  })

  it('should accept dataKey prop', () => {
    const wrapper = mount(VirtualList, {
      props: {
        dataKey: 'id',
      },
    })

    expect(wrapper.props('dataKey')).toBe('id')

    wrapper.unmount()
  })

  it('should accept items prop', () => {
    const wrapper = mount(VirtualList, {
      props: {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        dataKey: 'id',
      },
    })

    expect(wrapper.props('items')).toHaveLength(3)

    wrapper.unmount()
  })

  it('should accept itemSize prop', () => {
    const wrapper = mount(VirtualList, {
      props: {
        itemSize: 60,
      },
    })

    expect(wrapper.props('itemSize')).toBe(60)

    wrapper.unmount()
  })

  it('exposes a toc source over the virtualizer', () => {
    const wrapper = mount(VirtualList, {
      props: {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        dataKey: 'id',
      },
    })

    const tocSource = (wrapper.vm as unknown as { tocSource: TocScrollSource }).tocSource

    expect(tocSource.getOffsetForIndex(0)).toBe(0)
    expect(typeof tocSource.scrollToIndex).toBe('function')

    wrapper.unmount()
  })
})
