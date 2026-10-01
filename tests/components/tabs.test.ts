import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import { createSSRApp, defineComponent, h, nextTick, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import Tabs from '../../src/components/tabs/index.vue'

const OPTIONS = [
  { label: 'First', value: '1' },
  { label: 'Second', value: '2' },
]

function createStatefulChild() {
  return defineComponent({
    props: { name: String },
    setup(props) {
      const count = ref(0)

      return () =>
        h(
          'button',
          { class: `child-${props.name}`, onClick: () => (count.value += 1) },
          `${props.name}:${count.value}`,
        )
    },
  })
}

function mountWithModel(props: Record<string, any> = {}, slots?: Record<string, any>) {
  const active = ref(props.modelValue ?? '1')

  const wrapper = mount(
    defineComponent({
      setup() {
        return () =>
          h(
            Tabs,
            {
              options: OPTIONS,
              ...props,
              modelValue: active.value,
              'onUpdate:modelValue': (value: unknown) => (active.value = value as string),
            },
            slots,
          )
      },
    }),
  )

  return { wrapper, active }
}

describe('tabs', () => {
  it('renders properly', () => {
    const wrapper = mount(Tabs, {
      props: {
        options: OPTIONS,
      },
    })

    expect(wrapper.find('.pxd-tabs').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should default variant to default', () => {
    const wrapper = mount(Tabs, {
      props: {
        options: OPTIONS,
      },
    })

    expect(wrapper.props('variant')).toBe('default')

    wrapper.unmount()
  })

  it('should accept custom variant', () => {
    const wrapper = mount(Tabs, {
      props: {
        options: OPTIONS,
        variant: 'segmented',
      },
    })

    expect(wrapper.props('variant')).toBe('segmented')

    wrapper.unmount()
  })

  it('should render one tab and one panel per option', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '1',
        options: OPTIONS,
      },
      slots: {
        item: ({ option }: { option: { label: string } }) =>
          h('div', { class: `panel-${option.label}` }, `${option.label} content`),
      },
    })

    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')
    const panels = wrapper.findAll('[role="tabpanel"]')

    expect(tabs).toHaveLength(2)
    expect(panels).toHaveLength(2)
    expect(tabs.map((tab) => tab.text()).join()).toBe('First,Second')
    expect(panels[0]!.text()).toBe('First content')
    expect(panels[1]!.text()).toBe('')

    wrapper.unmount()
  })

  it('should wire every tab to its own panel and hide the inactive one', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '1',
        options: OPTIONS,
      },
    })

    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')

    tabs.forEach((tab) => {
      const panel = wrapper.find(`#${tab.attributes('aria-controls')}`)

      expect(panel.exists()).toBe(true)
      expect(panel.attributes('role')).toBe('tabpanel')
      expect(panel.attributes('aria-labelledby')).toBe(tab.attributes('id'))
      expect(panel.attributes('id')).not.toBe(tab.attributes('id'))
    })

    expect(
      wrapper.find('#' + tabs[0]!.attributes('aria-controls')!).attributes('hidden'),
    ).toBeUndefined()
    expect(
      wrapper.find('#' + tabs[1]!.attributes('aria-controls')!).attributes('hidden'),
    ).toBeDefined()

    wrapper.unmount()
  })

  it('should keep ids unique across instances', async () => {
    const wrapper = mount(
      defineComponent({
        setup() {
          const group = (key: string) => h(Tabs, { key, modelValue: '1', options: OPTIONS })

          return () => h('div', null, [group('first'), group('second')])
        },
      }),
    )

    await nextTick()

    const ids = wrapper.findAll('[id]').map((node) => node.attributes('id'))

    expect(ids).toHaveLength(8)
    expect(new Set(ids).size).toBe(ids.length)

    wrapper.unmount()
  })

  it('should render the tab bar on the server', async () => {
    const html = await renderToString(
      createSSRApp({
        render: () => h(Tabs, { modelValue: '1', options: OPTIONS }),
      }),
    )

    expect(html).toContain('role="tablist"')
    expect(html.match(/role="tab"/g)).toHaveLength(2)
    expect(html).toContain('First')
    expect(html).toContain('role="tabpanel"')
  })

  it('should emit update:modelValue and change exactly once per click', async () => {
    const { wrapper, active } = mountWithModel()
    const tabs = wrapper.findComponent(Tabs)

    await nextTick()
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    expect(tabs.emitted('update:modelValue')).toEqual([['2']])
    expect(tabs.emitted('change')).toEqual([['2']])
    expect(active.value).toBe('2')

    wrapper.unmount()
  })

  it('should not emit when the active tab is clicked again', async () => {
    const { wrapper } = mountWithModel()
    const tabs = wrapper.findComponent(Tabs)

    await nextTick()
    await wrapper.findAll('[role="tab"]')[0]!.trigger('click')

    expect(tabs.emitted('change')).toBeUndefined()
    expect(tabs.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should ignore clicks on a disabled tab', async () => {
    const { wrapper } = mountWithModel({
      options: [OPTIONS[0]!, { ...OPTIONS[1]!, disabled: true }],
    })
    const tabs = wrapper.findComponent(Tabs)

    await nextTick()
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    expect(tabs.emitted('change')).toBeUndefined()
    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('First')

    wrapper.unmount()
  })

  it('should preserve numeric values', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: 1,
        options: [
          { label: 'One', value: 1 },
          { label: 'Two', value: 2 },
        ],
      },
    })

    const tabs = wrapper.findComponent(Tabs)

    await nextTick()
    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    expect(tabs.emitted('update:modelValue')).toEqual([[2]])
    expect(tabs.emitted('change')).toEqual([[2]])

    wrapper.unmount()
  })

  it('should work uncontrolled when no modelValue is bound', async () => {
    const wrapper = mount(Tabs, {
      props: {
        options: OPTIONS,
      },
    })

    await nextTick()
    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(0)

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')

    expect(wrapper.findAll('[aria-selected="true"]')).toHaveLength(1)
    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('Second')

    wrapper.unmount()
  })

  it('should select defaultValue when nothing is bound', async () => {
    const wrapper = mount(Tabs, {
      props: {
        defaultValue: '2',
        options: OPTIONS,
      },
    })

    await nextTick()

    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('Second')

    wrapper.unmount()
  })

  it('should follow the order of the options', async () => {
    const options = ref([
      { label: 'A', value: 'a' },
      { label: 'B', value: 'b' },
      { label: 'C', value: 'c' },
    ])

    const wrapper = mount(
      defineComponent({
        setup() {
          return () => h(Tabs, { modelValue: 'a', options: options.value })
        },
      }),
    )

    await nextTick()
    expect(
      wrapper
        .findAll('[role="tab"]')
        .map((tab) => tab.text())
        .join(),
    ).toBe('A,B,C')

    options.value = [options.value[2]!, options.value[0]!, options.value[1]!]
    await nextTick()

    expect(
      wrapper
        .findAll('[role="tab"]')
        .map((tab) => tab.text())
        .join(),
    ).toBe('C,A,B')
    expect(
      wrapper
        .findAll('[role="tabpanel"]')
        .map((panel) => panel.text())
        .join(),
    ).toBe(',,')

    wrapper.unmount()
  })

  it('should move selection with arrow, Home and End keys', async () => {
    const { wrapper } = mountWithModel()

    await nextTick()

    const tablist = wrapper.find('[role="tablist"]')

    await tablist.trigger('keydown', { key: 'ArrowRight' })
    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('Second')

    await tablist.trigger('keydown', { key: 'ArrowLeft' })
    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('First')

    await tablist.trigger('keydown', { key: 'End' })
    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('Second')

    await tablist.trigger('keydown', { key: 'Home' })
    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('First')

    expect(
      wrapper
        .findAll('[role="tab"]')
        .map((tab) => tab.attributes('tabindex'))
        .join(),
    ).toBe('0,-1')

    wrapper.unmount()
  })

  it('renders multi-root item content through keep-alive', async () => {
    const { wrapper } = mountWithModel(
      { keepAlive: true },
      {
        item: ({ option }: { option: { value: string } }) => [
          h('p', `a-${option.value}`),
          h('p', `b-${option.value}`),
        ],
      },
    )

    await nextTick()
    expect(
      wrapper
        .findAll('.pxd-tabs--panel p')
        .map((p) => p.text())
        .join(),
    ).toBe('a-1,b-1')

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await wrapper.findAll('[role="tab"]')[0]!.trigger('click')

    expect(
      wrapper
        .findAll('.pxd-tabs--panel p')
        .map((p) => p.text())
        .join(),
    ).toBe('a-1,b-1,a-2,b-2')

    wrapper.unmount()
  })

  it('falls back to the option label when no label slot is given', async () => {
    const wrapper = mount(Tabs, {
      props: { modelValue: '1', options: [{ label: 'First', value: '1' }, { value: '2' }] },
    })

    await nextTick()

    expect(wrapper.findAll('[role="tab"]')[1]!.text()).toBe('')

    wrapper.unmount()
  })

  it('re-renders only the panel whose own state changed', async () => {
    const state = ref(0)
    const renders = { label: 0, panel: 0 }

    const { wrapper } = mountWithModel(
      {},
      {
        label: () => {
          renders.label += 1

          return 'label'
        },
        item: ({ option }: { option: { value: string } }) => {
          renders.panel += 1

          return h('div', { class: 'panel' }, `${option.value}:${state.value}`)
        },
      },
    )

    await nextTick()
    const base = { ...renders }

    state.value = 1
    await nextTick()

    expect(wrapper.find('.panel').text()).toBe('1:1')
    expect(renders.panel).toBeGreaterThan(base.panel)
    expect(renders.label).toBe(base.label)

    wrapper.unmount()
  })

  it('should skip disabled options while navigating', async () => {
    const { wrapper } = mountWithModel({
      options: [OPTIONS[0]!, { ...OPTIONS[1]!, disabled: true }, { label: 'Third', value: '3' }],
    })

    await nextTick()
    await wrapper.find('[role="tablist"]').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.findAll('[aria-selected="true"]')[0]!.text()).toBe('Third')

    wrapper.unmount()
  })

  it('should keep panel state with keep-alive and reset it without', async () => {
    const Child = createStatefulChild()
    const slots = { item: () => h(Child, { name: 'a' }) }

    const kept = mountWithModel({ keepAlive: true }, slots)

    await nextTick()
    await kept.wrapper.find('.child-a').trigger('click')
    expect(kept.wrapper.find('.child-a').text()).toBe('a:1')

    await kept.wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await kept.wrapper.findAll('[role="tab"]')[0]!.trigger('click')
    expect(kept.wrapper.find('.child-a').text()).toBe('a:1')

    kept.wrapper.unmount()

    const dropped = mountWithModel({}, slots)

    await nextTick()
    await dropped.wrapper.find('.child-a').trigger('click')
    expect(dropped.wrapper.find('.child-a').text()).toBe('a:1')

    await dropped.wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await dropped.wrapper.findAll('[role="tab"]')[0]!.trigger('click')
    expect(dropped.wrapper.find('.child-a').text()).toBe('a:0')

    dropped.wrapper.unmount()
  })

  it('should let the label slot override the option label', async () => {
    const wrapper = mount(Tabs, {
      props: {
        modelValue: '1',
        options: OPTIONS,
      },
      slots: {
        label: ({ active, option }: { active: boolean; option: { value: string } }) =>
          h('span', { 'data-active': String(active) }, `slot-${option.value}`),
      },
    })

    await nextTick()

    const tabs = wrapper.findAll('[role="tab"]')

    expect(tabs[0]!.text()).toBe('slot-1')
    expect(tabs[1]!.text()).toBe('slot-2')
    expect(tabs[0]!.find('span').attributes('data-active')).toBe('true')
    expect(tabs[1]!.find('span').attributes('data-active')).toBe('false')

    wrapper.unmount()
  })

  it('should expose the active flag to the item slot', async () => {
    const seen: boolean[] = []
    const { wrapper } = mountWithModel(
      {},
      {
        item: ({ active, option }: { active: boolean; option: { value: string } }) => {
          seen.push(active)

          return h('div', { class: 'panel' }, option.value)
        },
      },
    )

    await nextTick()
    expect(
      wrapper
        .findAll('.panel')
        .map((panel) => panel.text())
        .join(),
    ).toBe('1')

    await wrapper.findAll('[role="tab"]')[1]!.trigger('click')
    await nextTick()

    expect(
      wrapper
        .findAll('.panel')
        .map((panel) => panel.text())
        .join(),
    ).toBe('2')
    expect(seen.length).toBeGreaterThan(0)
    expect(seen.every((value) => value === true)).toBe(true)

    wrapper.unmount()
  })

  it('should warn when the bound value matches no option', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const wrapper = mount(Tabs, {
      props: {
        modelValue: 'missing',
        options: OPTIONS,
      },
    })

    await nextTick()

    expect(warn).toHaveBeenCalled()
    expect(warn.mock.calls[0]?.[0]).toContain('matches no option')

    warn.mockRestore()
    wrapper.unmount()
  })
})
