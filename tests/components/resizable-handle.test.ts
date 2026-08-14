import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import Resizable from '../../src/components/resizable/index.vue'
import ResizableHandle from '../../src/components/resizable-handle/index.vue'

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
})
