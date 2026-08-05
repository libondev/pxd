import { nextTick } from 'vue'
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import MarchingAnts from '../../src/components/marching-ants/index.vue'

describe('marching-ants', () => {
  it('renders slot content', () => {
    const wrapper = mount(MarchingAnts, {
      slots: {
        default: 'Content',
      },
    })

    expect(wrapper.text()).toContain('Content')

    wrapper.unmount()
  })

  it('creates one overlay for repeated clicks', async () => {
    const wrapper = mount(MarchingAnts, {
      attrs: {
        style: 'width: 120px; height: 80px; border-radius: 12px;',
      },
    })
    const target = wrapper.find('.pxd-marching-ants--target')

    await target.trigger('click')
    await target.trigger('click')

    expect(wrapper.findAll('.pxd-marching-ants--overlay')).toHaveLength(1)
    expect(wrapper.find('.pxd-marching-ants--shape').exists()).toBe(true)

    wrapper.unmount()
  })

  it('exposes select and deselect methods', async () => {
    const wrapper = mount(MarchingAnts, {
      attrs: {
        style: 'width: 120px; height: 80px; border-radius: 12px;',
      },
    })
    const instance = wrapper.vm as unknown as {
      deselect: () => void
      select: () => void
    }

    instance.select()
    await nextTick()
    expect(wrapper.find('.pxd-marching-ants--overlay').exists()).toBe(true)

    instance.deselect()
    await nextTick()
    expect(wrapper.find('.pxd-marching-ants--overlay').exists()).toBe(false)

    wrapper.unmount()
  })
})
