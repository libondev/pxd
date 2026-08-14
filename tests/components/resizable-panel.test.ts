import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h } from 'vue'
import Resizable from '../../src/components/resizable/index.vue'
import ResizablePanel from '../../src/components/resizable-panel/index.vue'

describe('resizable-panel', () => {
  it('renders with slot content', () => {
    const wrapper = mount(Resizable, {
      slots: {
        default: () =>
          h(ResizablePanel, null, () => h('div', { class: 'panel-content' }, 'Panel')),
      },
    })

    expect(wrapper.find('.pxd-resizable-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Panel')

    wrapper.unmount()
  })
})
