import type { VirtualListScrollSource } from '../../src/composables/use-virtual-list'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
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

  it('exposes a toc source over the virtualizer', async () => {
    const wrapper = mount(VirtualList, {
      props: {
        items: [{ id: 1 }, { id: 2 }, { id: 3 }],
        dataKey: 'id',
      },
    })

    const scrollSource = (wrapper.vm as unknown as { scrollSource: VirtualListScrollSource })
      .scrollSource

    // The virtualizer measures its container on the next frame, so the offset arrives a flush
    // later. Poll instead of counting frames: under a full parallel pool a frame can be starved.
    await vi.waitFor(() => expect(scrollSource.getOffsetForIndex(0)).toBe(0), { timeout: 5000 })
    expect(typeof scrollSource.scrollToIndex).toBe('function')

    wrapper.unmount()
  })
})
