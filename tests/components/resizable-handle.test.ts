import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { h } from 'vue'
import ResizableHandle from '../../src/components/resizable-handle/index.vue'
import ResizablePanel from '../../src/components/resizable-panel/index.vue'
import Resizable from '../../src/components/resizable/index.vue'

describe('resizable-handle', () => {
  it('renders with data-handler when withHandle is set', () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () => h(ResizableHandle, { withHandle: true }),
      },
    })

    const handle = wrapper.findComponent(ResizableHandle)
    expect(handle.exists()).toBe(true)
    expect(handle.classes()).toContain('pxd-resizable-handle')
    expect(handle.attributes('data-handler')).toBe('true')

    wrapper.unmount()
  })

  it('should omit data-handler when withHandle is not set', () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () => h(ResizableHandle),
      },
    })

    expect(wrapper.findComponent(ResizableHandle).attributes('data-handler')).toBe('false')

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () => h(ResizableHandle, { id: 'my-handle' }),
      },
    })

    expect(wrapper.findComponent(ResizableHandle).attributes('id')).toBe('my-handle')

    wrapper.unmount()
  })

  it('should reset panels to their configured sizes on double click', async () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () => [
          h(ResizablePanel, { size: 30 }, () => 'A'),
          h(ResizableHandle),
          h(ResizablePanel, null, () => 'B'),
        ],
      },
    })

    const panels = wrapper.findAll('.pxd-resizable-panel')

    await vi.waitFor(() => {
      expect(panels[0]!.attributes('style')).toContain('flex-basis: 30%')
    })

    await wrapper.findComponent(ResizableHandle).trigger('dblclick')

    await vi.waitFor(() => {
      expect(panels[0]!.attributes('style')).toContain('flex-basis: 30%')
    })

    wrapper.unmount()
  })
})
