import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import ResizableHandle from '../../src/components/resizable-handle/index.vue'
import ResizablePanel from '../../src/components/resizable-panel/index.vue'
import Resizable from '../../src/components/resizable/index.vue'
import { flush, readSizes } from '../helpers/resizable'

function mountPanels(children: () => any[]) {
  const wrapper = mount(Resizable, { slots: { default: children } })

  return wrapper
}

describe('resizable-panel', () => {
  it('renders with slot content', () => {
    const wrapper = mountPanels(() => [h(ResizablePanel, null, () => 'Panel')])

    expect(wrapper.find('.pxd-resizable-panel').exists()).toBe(true)
    expect(wrapper.text()).toContain('Panel')

    wrapper.unmount()
  })

  it('applies flex basis from the resolved sizes', async () => {
    const wrapper = mountPanels(() => [
      h(ResizablePanel, { size: 30 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, null, () => 'B'),
    ])
    await flush()

    const panels = wrapper.findAll('.pxd-resizable-panel')

    expect(readSizes(wrapper)).toEqual([30, 70])
    expect(panels[0]!.attributes('style')).toContain('flex-grow: 0')
  })

  it('lays out from its own prop before the group has sized itself', () => {
    const wrapper = mountPanels(() => [
      h(ResizablePanel, { size: 30 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 70 }, () => 'B'),
    ])

    // Read synchronously: the first paint must already be right, and it is what
    // a server rendered pass emits.
    expect(wrapper.findAll('.pxd-resizable-panel')[0]!.attributes('style')).toContain(
      'flex-basis: 30%',
    )

    wrapper.unmount()
  })

  it('renders a collapsed panel as a zero basis instead of a flexible one', async () => {
    const Host = defineComponent({
      setup: () => () =>
        h(Resizable, { modelValue: [0, 100] }, () => [
          h(ResizablePanel, null, () => 'A'),
          h(ResizableHandle),
          h(ResizablePanel, null, () => 'B'),
        ]),
    })

    const wrapper = mount(Host)
    await flush()

    const style = wrapper.findAll('.pxd-resizable-panel')[0]!.attributes('style')

    expect(style).toContain('flex-basis: 0%')
    expect(style).toContain('flex-grow: 0')

    wrapper.unmount()
  })

  it('lets the row shrink so handles do not clip the last panel', async () => {
    const wrapper = mountPanels(() => [h(ResizablePanel, { size: 50 }, () => 'A')])
    await flush()

    expect(wrapper.find('.pxd-resizable-panel').attributes('style')).toContain('flex-shrink: 1')

    wrapper.unmount()
  })

  it('renders auto sized panels with a flexible basis', async () => {
    const wrapper = mountPanels(() => [h(ResizablePanel, null, () => 'A')])
    await flush()

    // A single auto panel takes the whole group.
    expect(wrapper.find('.pxd-resizable-panel').attributes('style')).toContain('flex-basis: 100%')

    wrapper.unmount()
  })

  it('generates an id and lets aria-controls point at both panels', async () => {
    const wrapper = mountPanels(() => [
      h(ResizablePanel, { size: 50 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 50 }, () => 'B'),
    ])
    await flush()

    const panels = wrapper.findAll('.pxd-resizable-panel')
    const controls = wrapper.find('.pxd-resizable-handle').attributes('aria-controls')

    expect(panels[0]!.attributes('id')).toMatch(/-panel-0$/)
    expect(panels[1]!.attributes('id')).toMatch(/-panel-1$/)
    expect(controls).toBe(`${panels[0]!.attributes('id')} ${panels[1]!.attributes('id')}`)

    wrapper.unmount()
  })

  it('prefers an explicit id over the generated one', async () => {
    const wrapper = mountPanels(() => [
      h(ResizablePanel, { id: 'sidebar', size: 50 }, () => 'A'),
      h(ResizableHandle),
      h(ResizablePanel, { size: 50 }, () => 'B'),
    ])
    await flush()

    const panels = wrapper.findAll('.pxd-resizable-panel')

    expect(panels[0]!.attributes('id')).toBe('sidebar')
    expect(wrapper.find('.pxd-resizable-handle').attributes('aria-controls')).toContain('sidebar')

    wrapper.unmount()
  })

  it('warns about a min-size bigger than the max-size', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mountPanels(() => [h(ResizablePanel, { minSize: 80, maxSize: 20 })])
    await flush()

    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('min-size (80) is bigger than max-size (20)'),
    )

    wrapper.unmount()
    warn.mockRestore()
  })

  it('passes through attrs', () => {
    const wrapper = mountPanels(() => [h(ResizablePanel, { 'data-test': 'panel' })])

    expect(wrapper.find('.pxd-resizable-panel').attributes('data-test')).toBe('panel')

    wrapper.unmount()
  })
})
