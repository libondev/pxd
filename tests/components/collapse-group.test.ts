import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, nextTick } from 'vue'
import CollapseGroup from '../../src/components/collapse-group/index.vue'
import Collapse from '../../src/components/collapse/index.vue'

function openStates(wrapper: ReturnType<typeof mount>) {
  return wrapper.findAll('details').map((item) => (item.element as HTMLDetailsElement).open)
}

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

    await wrapper.findAll('summary')[0]!.trigger('click')
    await nextTick()
    await nextTick()
    expect(openStates(wrapper)).toEqual([true, false])

    await wrapper.findAll('summary')[1]!.trigger('click')
    await nextTick()
    await nextTick()
    expect(openStates(wrapper)).toEqual([false, true])

    wrapper.unmount()
  })

  it('applies the expand command with accordion exclusivity', async () => {
    const Host = defineComponent({
      components: { Collapse, CollapseGroup },
      props: { expandA: Boolean, expandB: Boolean },
      template: `
        <CollapseGroup>
          <Collapse title="A" :expand="expandA">a-body</Collapse>
          <Collapse title="B" :expand="expandB">b-body</Collapse>
        </CollapseGroup>
      `,
    })

    const wrapper = mount(Host, { props: { expandA: true, expandB: true } })
    await nextTick()
    await nextTick()

    expect(openStates(wrapper)).toEqual([false, true])

    await wrapper.setProps({ expandA: false, expandB: false })
    await nextTick()
    await nextTick()

    expect(openStates(wrapper)).toEqual([false, false])

    wrapper.unmount()
  })

  it('releases the accordion slot when the open panel unmounts', async () => {
    const Host = defineComponent({
      components: { Collapse, CollapseGroup },
      props: { showA: Boolean, showC: Boolean },
      template: `
        <CollapseGroup>
          <Collapse v-if="showA" title="A">a-body</Collapse>
          <Collapse v-if="showC" expand title="C">c-body</Collapse>
        </CollapseGroup>
      `,
    })

    const wrapper = mount(Host, { props: { showA: true, showC: false } })

    await wrapper.findAll('summary')[0]!.trigger('click')
    await nextTick()
    await nextTick()
    expect(openStates(wrapper)).toEqual([true])

    await wrapper.setProps({ showA: false })
    await nextTick()

    await wrapper.setProps({ showC: true })
    await nextTick()
    await nextTick()
    expect(openStates(wrapper)).toEqual([true])

    wrapper.unmount()
  })

  it('keeps several panels open in multiple mode', async () => {
    const Host = defineComponent({
      components: { Collapse, CollapseGroup },
      template: `
        <CollapseGroup multiple>
          <Collapse title="A">a-body</Collapse>
          <Collapse title="B">b-body</Collapse>
        </CollapseGroup>
      `,
    })

    const wrapper = mount(Host)

    await wrapper.findAll('summary')[0]!.trigger('click')
    await nextTick()
    await wrapper.findAll('summary')[1]!.trigger('click')
    await nextTick()
    await nextTick()

    expect(openStates(wrapper)).toEqual([true, true])

    wrapper.unmount()
  })
})
