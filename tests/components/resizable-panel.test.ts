import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { h } from 'vue'
import ResizablePanel from '../../src/components/resizable-panel/index.vue'
import Resizable from '../../src/components/resizable/index.vue'

describe('resizable-panel', () => {
  it('renders with slot content', () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () => h(ResizablePanel, null, () => h('div', { class: 'panel-content' }, 'Panel')),
      },
    })

    expect(wrapper.find('.pxd-resizable-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Panel')

    wrapper.unmount()
  })

  it('should apply flex basis from panel sizes', async () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () => [
          h(ResizablePanel, { size: 30 }, () => 'A'),
          h(ResizablePanel, null, () => 'B'),
        ],
      },
    })

    const panels = wrapper.findAll('.pxd-resizable-panel')

    await vi.waitFor(() => {
      expect(panels[0]!.attributes('style')).toContain('flex-basis: 30%')
    })
    expect(panels[0]!.attributes('style')).toContain('flex-grow: 0')
    expect(panels[1]!.attributes('style')).toContain('flex-basis: 70%')

    wrapper.unmount()
  })

  it('should pass through attrs', () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () => h(ResizablePanel, { id: 'my-panel' }),
      },
    })

    expect(wrapper.find('.pxd-resizable-panel').attributes('id')).toBe('my-panel')

    wrapper.unmount()
  })
})
