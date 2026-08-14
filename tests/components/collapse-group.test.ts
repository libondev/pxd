import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import CollapseGroup from '../../src/components/collapse-group/index.vue'

describe('collapse-group', () => {
  it('renders with slot content', () => {
    const wrapper = mount(CollapseGroup, {
      slots: { default: '<div class="panel">Panel content</div>' },
    })

    expect(wrapper.find('.pxd-collapse-group').exists()).toBe(true)
    expect(wrapper.text()).toContain('Panel content')

    wrapper.unmount()
  })

  it('applies size-based css variables', () => {
    const wrapper = mount(CollapseGroup, {
      props: { size: 'sm' },
    })

    expect(wrapper.element.style.getPropertyValue('--collapse-padding')).toBe('12px')
    expect(wrapper.element.style.getPropertyValue('--collapse-font-size')).toBe('16px')

    wrapper.unmount()
  })
})
