import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, nextTick } from 'vue'
import CollapseGroup from '../../src/components/collapse-group/index.vue'
import Collapse from '../../src/components/collapse/index.vue'

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

  it('opens one panel at a time unless multiple', async () => {
    const Host = defineComponent({
      components: { Collapse, CollapseGroup },
      template: `
        <CollapseGroup>
          <Collapse title="A">a-body</Collapse>
          <Collapse title="B">b-body</Collapse>
        </CollapseGroup>
      `,
    })

    const wrapper = mount(Host)
    const details = () =>
      wrapper.findAll('details').map((item) => (item.element as HTMLDetailsElement).open)

    await wrapper.findAll('summary')[0]!.trigger('click')
    await nextTick()
    await nextTick()
    expect(details()).toEqual([true, false])

    await wrapper.findAll('summary')[1]!.trigger('click')
    await nextTick()
    await nextTick()
    expect(details()).toEqual([false, true])

    wrapper.unmount()
  })
})
