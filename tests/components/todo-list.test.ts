import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
import { h, nextTick, ref } from 'vue'
import TodoList from '../../src/components/todo-list/index.vue'

const OPTIONS = [
  { content: 'Rewrite types.d.ts', status: 'in_progress' },
  { content: 'Delete legacy components', status: 'pending' },
  { content: 'Sync docs', status: 'completed' },
]

async function mountTodoList(props: Record<string, unknown> = {}, slots?: Record<string, unknown>) {
  const wrapper = mount(TodoList, {
    props: { options: OPTIONS, ...props },
    slots,
    global: {
      mocks: {
        // The default locale is enUS; the header text depends on it.
      },
    },
  })

  await nextTick()

  return wrapper
}

describe('todo-list', () => {
  it('renders every option with its content', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })

    expect(wrapper.findAll('.pxd-todo-list--item')).toHaveLength(3)
    expect(wrapper.text()).toContain('Rewrite types.d.ts')
    expect(wrapper.text()).toContain('Sync docs')

    wrapper.unmount()
  })

  it('renders an option description', async () => {
    const wrapper = await mountTodoList({
      defaultExpanded: true,
      options: [{ content: 'Task', description: 'Extra detail' }],
    })

    expect(wrapper.find('.pxd-todo-list--description').text()).toBe('Extra detail')

    wrapper.unmount()
  })

  it('exposes the resolved status on each row', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })
    const items = wrapper.findAll('.pxd-todo-list--item')

    expect(items[0]?.attributes('data-status')).toBe('in_progress')
    expect(items[1]?.attributes('data-status')).toBe('pending')
    expect(items[2]?.attributes('data-status')).toBe('completed')

    wrapper.unmount()
  })

  it('falls back to pending when an option has no status', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true, options: [{ content: 'Task' }] })

    expect(wrapper.find('.pxd-todo-list--item').attributes('data-status')).toBe('pending')

    wrapper.unmount()
  })

  it('lays each row out horizontally', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })

    for (const item of wrapper.findAll('.pxd-todo-list--item')) {
      expect(item.classes()).toContain('flex')
      expect(item.find('.pxd-todo-list--indicator').exists()).toBe(true)
      expect(item.find('.pxd-todo-list--body').exists()).toBe(true)
    }

    wrapper.unmount()
  })

  it('draws a block marker box so the empty circle keeps its size', async () => {
    const wrapper = await mountTodoList({
      defaultExpanded: true,
      options: [
        { content: 'A', status: 'pending' },
        { content: 'B', status: 'completed' },
        { content: 'C', status: 'canceled' },
      ],
    })
    const markers = wrapper.findAll('.pxd-todo-list--marker')

    expect(markers).toHaveLength(3)
    expect(markers.map((marker) => marker.classes())).toEqual(
      expect.arrayContaining([
        expect.arrayContaining(['block', 'rounded-full']),
        expect.arrayContaining(['block', 'rounded-full']),
        expect.arrayContaining(['block', 'rounded-full']),
      ]),
    )

    // Only the running state draws the spinner itself; the rest share one box.
    expect(markers[0]?.find('svg').exists()).toBe(false)
    expect(markers[1]?.find('svg').exists()).toBe(true)
    expect(markers[2]?.find('svg').exists()).toBe(true)

    wrapper.unmount()
  })

  it('summarises active counts in the header', async () => {
    const wrapper = await mountTodoList()

    expect(wrapper.find('.pxd-todo-list--title').text()).toBe('Tasks')
    expect(wrapper.find('.pxd-todo-list--summary').text()).toBe('1 in progress · 1 pending')

    wrapper.unmount()
  })

  it('summarises finished counts once nothing is active', async () => {
    const wrapper = await mountTodoList({
      options: [
        { content: 'A', status: 'completed' },
        { content: 'B', status: 'canceled' },
      ],
    })

    expect(wrapper.find('.pxd-todo-list--summary').text()).toBe('1 completed · 1 canceled')

    wrapper.unmount()
  })

  it('uses a custom header title', async () => {
    const wrapper = await mountTodoList({ title: 'Plan' })

    expect(wrapper.find('.pxd-todo-list--title').text()).toBe('Plan')

    wrapper.unmount()
  })

  it('omits the summary for an empty list', async () => {
    const wrapper = await mountTodoList({ options: [] })

    expect(wrapper.find('.pxd-todo-list--summary').exists()).toBe(false)
    expect(wrapper.find('.pxd-todo-list--empty').text()).toBe('No data available')

    wrapper.unmount()
  })

  it('uses a custom empty text', async () => {
    const wrapper = await mountTodoList({ options: [], empty: 'Nothing here' })

    expect(wrapper.find('.pxd-todo-list--empty').text()).toBe('Nothing here')

    wrapper.unmount()
  })

  it('cycles the status forward when an indicator is clicked', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })

    await wrapper.findAll('.pxd-todo-list--indicator')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({
      index: 1,
      status: 'in_progress',
      prevStatus: 'pending',
    })
    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      OPTIONS[0],
      { content: 'Delete legacy components', status: 'in_progress' },
      OPTIONS[2],
    ])

    wrapper.unmount()
  })

  it('reopens a completed item', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })

    await wrapper.findAll('.pxd-todo-list--indicator')[2]?.trigger('click')
    await nextTick()

    expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({
      index: 2,
      status: 'pending',
      prevStatus: 'completed',
    })

    wrapper.unmount()
  })

  it('reopens a canceled item', async () => {
    const wrapper = await mountTodoList({
      defaultExpanded: true,
      options: [{ content: 'A', status: 'canceled' }],
    })

    await wrapper.find('.pxd-todo-list--indicator').trigger('click')
    await nextTick()

    expect(wrapper.emitted('change')?.[0]?.[0]).toMatchObject({
      status: 'pending',
      prevStatus: 'canceled',
    })

    wrapper.unmount()
  })

  it('updates internal state when uncontrolled', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })

    await wrapper.findAll('.pxd-todo-list--indicator')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.findAll('.pxd-todo-list--item')[1]?.attributes('data-status')).toBe(
      'in_progress',
    )

    wrapper.unmount()
  })

  it('keeps rendering the bound modelValue', async () => {
    const modelValue = ref(OPTIONS)
    const wrapper = mount(TodoList, {
      props: { options: [], modelValue: modelValue.value, defaultExpanded: true },
    })

    await nextTick()
    await wrapper.findAll('.pxd-todo-list--indicator')[1]?.trigger('click')
    await nextTick()

    expect(wrapper.findAll('.pxd-todo-list--item')).toHaveLength(3)
    expect(wrapper.findAll('.pxd-todo-list--item')[1]?.attributes('data-status')).toBe('pending')

    wrapper.unmount()
  })

  it('ignores clicks when readonly', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true, readonly: true })

    expect(wrapper.findAll('.pxd-todo-list--indicator')[0]?.attributes('disabled')).toBeDefined()

    await wrapper.find('.pxd-todo-list--item').trigger('click')
    await nextTick()

    expect(wrapper.emitted('change')).toBeUndefined()
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('ignores clicks on a disabled item', async () => {
    const wrapper = await mountTodoList({
      defaultExpanded: true,
      options: [{ content: 'A', disabled: true }],
    })

    await wrapper.find('.pxd-todo-list--item').trigger('click')
    await nextTick()

    expect(wrapper.emitted('change')).toBeUndefined()

    wrapper.unmount()
  })

  it('emits toggle and reveals the content', async () => {
    const wrapper = await mountTodoList()

    expect(wrapper.find('details').attributes('open')).toBeUndefined()

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect(wrapper.emitted('toggle')?.[0]?.[0]).toBe(true)
    expect(wrapper.find('details').attributes('open')).toBeDefined()

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect(wrapper.emitted('toggle')?.[1]?.[0]).toBe(false)

    wrapper.unmount()
  })

  it('stays open and silent when collapsible is off', async () => {
    const wrapper = await mountTodoList({ collapsible: false })

    await wrapper.find('summary').trigger('click')
    await nextTick()

    expect(wrapper.emitted('toggle')).toBeUndefined()
    expect(wrapper.find('details').attributes('open')).toBeDefined()
    expect(wrapper.find('.pxd-todo-list--caret').exists()).toBe(false)

    wrapper.unmount()
  })

  it('starts expanded when asked', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })

    expect(wrapper.find('details').attributes('open')).toBeDefined()

    wrapper.unmount()
  })

  it('drives the status through the exposed methods', async () => {
    const wrapper = await mountTodoList({
      defaultExpanded: true,
      options: [{ id: 'a', content: 'A' }],
    })
    const vm = wrapper.vm as any

    vm.start('a')
    await nextTick()
    expect(wrapper.find('.pxd-todo-list--item').attributes('data-status')).toBe('in_progress')

    vm.complete('a')
    await nextTick()
    expect(wrapper.find('.pxd-todo-list--item').attributes('data-status')).toBe('completed')

    vm.cancel('a')
    await nextTick()
    expect(wrapper.find('.pxd-todo-list--item').attributes('data-status')).toBe('canceled')

    vm.reset('a')
    await nextTick()
    expect(wrapper.find('.pxd-todo-list--item').attributes('data-status')).toBe('pending')

    wrapper.unmount()
  })

  it('resolves an exposed method argument as an index', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true })

    ;(wrapper.vm as any).complete(1)
    await nextTick()

    expect(wrapper.findAll('.pxd-todo-list--item')[1]?.attributes('data-status')).toBe('completed')

    wrapper.unmount()
  })

  it('ignores exposed status changes when readonly', async () => {
    const wrapper = await mountTodoList({ defaultExpanded: true, readonly: true })

    ;(wrapper.vm as any).complete(0)
    await nextTick()

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('exposes the expanded state and fold controls', async () => {
    const wrapper = await mountTodoList()
    const vm = wrapper.vm as any

    expect(vm.isExpanded).toBe(false)

    vm.expand()
    await nextTick()
    expect(vm.isExpanded).toBe(true)

    vm.collapse()
    await nextTick()
    expect(vm.isExpanded).toBe(false)

    vm.toggleExpand()
    await nextTick()
    expect(vm.isExpanded).toBe(true)

    vm.toggleExpand(false)
    await nextTick()
    expect(vm.isExpanded).toBe(false)

    wrapper.unmount()
  })

  it('exposes the running counts', async () => {
    const wrapper = await mountTodoList()

    expect((wrapper.vm as any).stats).toEqual({
      pending: 1,
      inProgress: 1,
      completed: 1,
      canceled: 0,
      total: 3,
    })

    wrapper.unmount()
  })

  it('follows a replaced options array', async () => {
    const wrapper = mount(TodoList, { props: { options: OPTIONS, defaultExpanded: true } })

    await nextTick()
    await wrapper.setProps({ options: [{ content: 'New task' }] })
    await nextTick()

    expect(wrapper.findAll('.pxd-todo-list--item')).toHaveLength(1)
    expect(wrapper.text()).toContain('New task')

    wrapper.unmount()
  })

  it('replaces the row through the item slot', async () => {
    const wrapper = await mountTodoList(
      { defaultExpanded: true },
      { item: '<p class="custom-row">custom</p>' },
    )

    expect(wrapper.findAll('.pxd-todo-list--item')).toHaveLength(3)
    expect(wrapper.find('.custom-row').exists()).toBe(true)
    expect(wrapper.find('.pxd-todo-list--indicator').exists()).toBe(false)

    wrapper.unmount()
  })

  it('replaces the text through the item-content slot', async () => {
    const wrapper = await mountTodoList(
      { defaultExpanded: true },
      {
        'item-content': (params: any) =>
          h('p', { class: 'custom-text' }, `${params.item.content}!`),
      },
    )

    expect(wrapper.find('.pxd-todo-list--indicator').exists()).toBe(true)
    expect(wrapper.find('.custom-text').text()).toBe('Rewrite types.d.ts!')

    wrapper.unmount()
  })

  it('replaces the header through the header slot', async () => {
    const wrapper = await mountTodoList(
      { defaultExpanded: true },
      { header: (params: any) => h('p', { class: 'custom-header' }, params.summary) },
    )

    expect(wrapper.find('.custom-header').text()).toBe('1 in progress · 1 pending')
    expect(wrapper.find('.pxd-todo-list--summary').exists()).toBe(false)

    wrapper.unmount()
  })
})
