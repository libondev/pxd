import type {
  TreeDropInfo,
  TreeLoadFn,
  TreeOption,
  TreeOptions,
  TreeRemoteFilterFn,
} from '../../src/components/tree/types'
import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vite-plus/test'
import Tree from '../../src/components/tree/index.vue'

const data = [
  {
    value: 'src',
    label: 'src',
    children: [
      {
        value: 'components',
        label: 'components',
        children: [
          { value: 'tree', label: 'tree' },
          { value: 'list', label: 'list' },
        ],
      },
      { value: 'composables', label: 'composables' },
    ],
  },
  { value: 'docs', label: 'docs', disabled: true },
  { value: 'readme', label: 'readme' },
]

describe('tree', () => {
  it('renders properly', () => {
    const wrapper = mount(Tree, { props: { data } })

    expect(wrapper.find('.pxd-tree').exists()).toBe(true)
    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    wrapper.unmount()
  })

  it('should expand from the switcher without selecting', async () => {
    const wrapper = mount(Tree, { props: { data } })

    await wrapper.find('[data-tree-switcher]').trigger('click')

    const detail = wrapper.emitted('expand')?.[0]?.[0] as { value?: string } | undefined

    expect(detail?.value).toBe('src')
    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual(['src'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.findAll('[data-tree-item]').length).toBe(5)

    wrapper.unmount()
  })

  it('should select a parent row without opening it by default', async () => {
    const wrapper = mount(Tree, { props: { data } })

    await wrapper.find('[data-key=src]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('src')
    expect(wrapper.emitted('update:expandedKeys')).toBeUndefined()
    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    wrapper.unmount()
  })

  it('should check a parent row without opening it by default', async () => {
    const wrapper = mount(Tree, { props: { data, multiple: true } })

    await wrapper.find('[data-key=src]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual([
      'src',
      'components',
      'tree',
      'list',
      'composables',
    ])
    expect(wrapper.emitted('update:expandedKeys')).toBeUndefined()

    wrapper.unmount()
  })

  it('should open a parent row without selecting it when expandOnly is set', async () => {
    const wrapper = mount(Tree, { props: { data, expandOnly: true } })

    await wrapper.find('[data-key=src]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual(['src'])

    // The rows below it are what a click selects.
    await wrapper.find('[data-key="readme"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('readme')

    wrapper.unmount()
  })

  it('should collapse an expanded row from its row when the switcher is hidden', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: [
          { value: 'src', label: 'src', children: [{ value: 'index.vue', label: 'index.vue' }] },
          { value: 'pxd', label: 'pxd', isLeaf: false },
          { value: 'file', label: 'file' },
        ],
        expandOnly: true,
        showSwitcher: false,
        expandedKeys: ['pxd', 'file'],
      },
    })

    // A key the caller put on a leaf stays open: nothing on that row can close it.
    expect(wrapper.find('[data-key="file"]').attributes('aria-expanded')).toBeUndefined()
    expect(wrapper.find('[data-key="pxd"]').attributes('aria-expanded')).toBe('true')

    await wrapper.find('[data-key="pxd"]').trigger('click')

    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual(['file'])
    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should reopen a parent collapsed from its row', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: [{ value: 'pxd', label: 'pxd', isLeaf: false }],
        expandOnly: true,
        showSwitcher: false,
        expandedKeys: ['pxd'],
      },
    })

    await wrapper.find('[data-key="pxd"]').trigger('click')

    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual([])

    await wrapper.setProps({ expandedKeys: [] })
    await wrapper.find('[data-key="pxd"]').trigger('click')

    expect(wrapper.emitted('update:expandedKeys')?.[1]?.[0]).toEqual(['pxd'])

    wrapper.unmount()
  })

  it('should leave a multiple selection to the checkbox when expandOnly is set', async () => {
    const wrapper = mount(Tree, { props: { data, multiple: true, expandOnly: true } })

    // The parent opens, and a row without children does nothing at all: picking is the checkbox's
    // job in a tree of checkboxes.
    await wrapper.find('[data-key=src]').trigger('click')
    await wrapper.find('[data-key="readme"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual(['src'])

    // A shift-click is a range ask rather than a pick, so it still reaches for one.
    await wrapper.find('[data-key="readme"]').trigger('click', { shiftKey: true })

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['readme'])

    // The checkbox still checks it, cascade and all.
    await wrapper.find('[data-key="src"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
      'src',
      'components',
      'tree',
      'list',
      'composables',
    ])

    wrapper.unmount()
  })

  it('should select a single node', async () => {
    const wrapper = mount(Tree, { props: { data, defaultExpandedKeys: ['src', 'components'] } })

    await wrapper.find('[data-key="list"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('list')
    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      value: 'list',
      node: { value: 'list', label: 'list' },
      checked: true,
      checkedValues: ['list'],
      halfCheckedValues: [],
    })

    wrapper.unmount()
  })

  it('should cascade a parent check down to its children', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, defaultExpandedKeys: ['src'] },
    })

    await wrapper.find('[data-key="components"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['components', 'tree', 'list'])

    wrapper.unmount()
  })

  it('should check a parent without its subtree when checkStrictly is set', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, checkStrictly: true, defaultExpandedKeys: ['src'] },
    })

    await wrapper.find('[data-key="src"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['src'])

    // Controlled: the parent feeds the model back before any row changes.
    await wrapper.setProps({ modelValue: ['src'] })

    expect(wrapper.find('[data-key="src"]').attributes('data-checked')).toBe('true')
    expect(wrapper.find('[data-key="composables"]').attributes('data-checked')).toBe('false')
    expect(wrapper.find('[data-key="src"]').attributes('data-indeterminate')).toBe('false')

    wrapper.unmount()
  })

  it('should keep a parent unchecked when only its children are picked', async () => {
    const wrapper = mount(Tree, {
      props: {
        data,
        multiple: true,
        checkStrictly: true,
        modelValue: ['tree', 'list'],
        defaultExpandedKeys: ['src', 'components'],
      },
    })

    expect(wrapper.find('[data-key="components"]').attributes('data-checked')).toBe('false')
    expect(wrapper.find('[data-key="components"]').attributes('data-indeterminate')).toBe('false')
    expect(wrapper.find('[data-key="src"]').attributes('aria-checked')).toBe('false')

    wrapper.unmount()
  })

  it('should uncheck a single node and keep the rest when checkStrictly is set', async () => {
    const wrapper = mount(Tree, {
      props: {
        data,
        multiple: true,
        checkStrictly: true,
        modelValue: ['tree', 'list'],
        defaultExpandedKeys: ['src', 'components'],
      },
    })

    await wrapper.find('[data-key="list"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['tree'])

    wrapper.unmount()
  })

  it('should ignore a disabled node when checkStrictly is set', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, checkStrictly: true },
    })

    await wrapper.find('[data-key="docs"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })
  it('should keep a partially checked parent out of the model', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, modelValue: ['tree'], defaultExpandedKeys: ['src'] },
    })

    const parent = wrapper.find('[data-key="components"]')

    expect(parent.attributes('aria-checked')).toBe('mixed')
    expect(parent.attributes('data-indeterminate')).toBe('true')
    expect(wrapper.find('[data-key="src"]').attributes('aria-checked')).toBe('mixed')

    wrapper.unmount()
  })

  it('should check the parent once every child is checked', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, modelValue: ['tree', 'list'], defaultExpandedKeys: ['src'] },
    })

    expect(wrapper.find('[data-key="components"]').attributes('aria-checked')).toBe('true')
    expect(wrapper.find('[data-key="src"]').attributes('aria-checked')).toBe('mixed')

    wrapper.unmount()
  })
  it('should ignore disabled nodes', async () => {
    const wrapper = mount(Tree, { props: { data } })

    await wrapper.find('[data-key="docs"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    wrapper.unmount()
  })

  it('should keep every disabled descendant out of a cascade', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: [
          {
            value: 'root',
            label: 'root',
            children: [
              { value: 'a', label: 'a' },
              { value: 'b', label: 'b', disabled: true },
            ],
          },
        ],
        multiple: true,
      },
    })

    await wrapper.find('[data-key="root"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toEqual(['root', 'a'])

    wrapper.unmount()
  })

  it('should keep a refused node out of the selection', async () => {
    const saved = [
      {
        value: 'src',
        label: 'src',
        saved: true,
        children: [
          { value: 'index.vue', label: 'index.vue', saved: true },
          { value: 'utils.ts', label: 'utils.ts' },
        ],
      },
      { value: 'readme', label: 'readme' },
    ]
    const wrapper = mount(Tree, {
      props: {
        data: saved,
        expandOnly: true,
        selectable: (node: TreeOption) => node.saved !== true,
      },
    })

    // What was saved already still opens, it just cannot be selected.
    await wrapper.find('[data-key="src"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.find('[data-key="src"]').attributes('aria-expanded')).toBe('true')

    await wrapper.find('[data-key="index.vue"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.find('[data-key="utils.ts"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('utils.ts')

    wrapper.unmount()
  })

  it('should still let a refused node take a drop', async () => {
    const saved = [
      {
        value: 'src',
        label: 'src',
        saved: true,
        children: [{ value: 'a.js', label: 'a.js' }],
      },
      { value: 'b.js', label: 'b.js' },
    ]
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data: saved,
        draggable: true,
        selectable: (node: TreeOption) => node.saved !== true,
      },
    })

    stubRows(wrapper)
    startDrag(wrapper, 'b.js', 48, 16)

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-key="src"]').attributes('data-drop')).toBe('inside')

    window.dispatchEvent(pointer('pointerup', 0, 16))

    expect(wrapper.emitted('update:data')?.length).toBe(1)

    wrapper.unmount()
  })

  it('should report a refused parent as partial without putting it in the model', async () => {
    const saved = [
      {
        value: 'src',
        label: 'src',
        saved: true,
        children: [
          { value: 'a.js', label: 'a.js' },
          { value: 'b.js', label: 'b.js' },
        ],
      },
    ]
    const wrapper = mount(Tree, {
      props: {
        data: saved,
        multiple: true,
        defaultExpandedKeys: ['src'],
        selectable: (node: TreeOption) => node.saved !== true,
      },
    })

    await wrapper.find('[data-key="a.js"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['a.js'])
    expect(wrapper.emitted('change')?.at(-1)?.[0]).toMatchObject({
      checkedValues: ['a.js'],
      halfCheckedValues: ['src'],
    })

    const emitted = wrapper.emitted('update:modelValue')?.length ?? 0

    await wrapper.find('[data-key="src"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.length).toBe(emitted)
    expect(wrapper.find('[data-key="src"] .pxd-tree--checkbox').attributes('data-selectable')).toBe(
      'false',
    )

    wrapper.unmount()
  })

  it('should keep a refused node the model already carries', async () => {
    const saved = [
      { value: 'a.js', label: 'a.js' },
      { value: 'b.js', label: 'b.js', saved: true },
    ]
    const wrapper = mount(Tree, {
      props: {
        data: saved,
        multiple: true,
        modelValue: ['a.js', 'b.js'],
        selectable: (node: TreeOption) => node.saved !== true,
      },
    })
    const vm = wrapper.vm as unknown as { getCheckedKeys: () => string[] }

    // A saved row opens as selected and stays that way, it just cannot be toggled any more.
    expect(vm.getCheckedKeys()).toEqual(['a.js', 'b.js'])

    await wrapper.find('[data-key="b.js"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    await wrapper.find('[data-key="a.js"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['b.js'])

    wrapper.unmount()
  })

  it('should skip a refused node in a shift-click range', async () => {
    const saved = [
      { value: 'a.js', label: 'a.js' },
      { value: 'src', label: 'src', saved: true },
      { value: 'b.js', label: 'b.js' },
    ]
    const wrapper = mount(Tree, {
      props: {
        data: saved,
        multiple: true,
        selectable: (node: TreeOption) => node.saved !== true,
      },
    })

    await wrapper.find('[data-key="a.js"]').trigger('click')
    await wrapper.find('[data-key="b.js"]').trigger('click', { shiftKey: true })

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(['a.js', 'b.js'])

    wrapper.unmount()
  })

  it('should take the range a shift-click spans, either way round', async () => {
    const range = ['src', 'components', 'tree', 'list', 'composables', 'readme']
    const mountTree = () =>
      mount(Tree, {
        props: { data, multiple: true, defaultExpandedKeys: ['src'] },
      })

    const down = mountTree()

    await down.find('[data-key="src"]').trigger('click')
    await down.find('[data-key="readme"]').trigger('click', { shiftKey: true })

    // `tree` and `list` sit in a collapsed node between the two ends, and `docs` is disabled.
    expect(down.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(range)

    down.unmount()

    const up = mountTree()

    await up.find('[data-key="readme"]').trigger('click')
    await up.find('[data-key="src"]').trigger('click', { shiftKey: true })

    expect(up.emitted('update:modelValue')?.at(-1)?.[0]).toEqual(range)

    // A disabled row cannot be an end of the range either.
    const emitted = up.emitted('update:modelValue')?.length ?? 0

    await up.find('[data-key="docs"]').trigger('click', { shiftKey: true })

    expect(up.emitted('update:modelValue')?.length).toBe(emitted)

    up.unmount()
  })

  it('should move the range a shift-click covers instead of piling it up', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, defaultExpandedKeys: ['src'] },
    })

    const last = () => wrapper.emitted('update:modelValue')?.at(-1)?.[0] as string[]
    // The model has to be fed back for a range to have anything to move: what is dropped is what
    // the previous extension left in it.
    const click = async (key: string, shift = false) => {
      await wrapper.find(`[data-key="${key}"]`).trigger('click', { shiftKey: shift })
      await wrapper.setProps({ modelValue: last() })
    }

    await click('src')
    await click('readme', true)

    expect(last()).toEqual(['src', 'components', 'tree', 'list', 'composables', 'readme'])

    // Shifting back inside the span shortens it: the wider end is dropped, not kept.
    await click('composables', true)

    expect(last()).toEqual(['src', 'components', 'tree', 'list', 'composables'])

    // …and reaching out again takes it back.
    await click('readme', true)

    expect(last()).toEqual(['src', 'components', 'tree', 'list', 'composables', 'readme'])

    wrapper.unmount()
  })

  it('should extend from the row the selection last landed on', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, defaultExpandedKeys: ['src'] },
    })

    const last = () => wrapper.emitted('update:modelValue')?.at(-1)?.[0] as string[]

    await wrapper.find('[data-key="src"]').trigger('click')
    await wrapper.setProps({ modelValue: last() })

    // Clearing it again leaves the anchor behind, so the shift-click still reaches from `src`.
    await wrapper.find('[data-key="src"]').trigger('click')
    await wrapper.setProps({ modelValue: last() })

    expect(last()).toEqual([])

    await wrapper.find('[data-key="readme"]').trigger('click', { shiftKey: true })

    expect(last()).toEqual(['src', 'components', 'tree', 'list', 'composables', 'readme'])

    wrapper.unmount()
  })

  it('should take the range without cascading when checkStrictly is set', async () => {
    const wrapper = mount(Tree, {
      props: {
        data,
        multiple: true,
        checkStrictly: true,
        defaultExpandedKeys: ['src'],
      },
    })

    const last = () => wrapper.emitted('update:modelValue')?.at(-1)?.[0] as string[]

    await wrapper.find('[data-key="components"]').trigger('click')
    await wrapper.setProps({ modelValue: last() })
    await wrapper.find('[data-key="readme"]').trigger('click', { shiftKey: true })

    // `src` sits above the range, and the cascade would have pulled it in.
    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toEqual([
      'components',
      'tree',
      'list',
      'composables',
      'readme',
    ])

    wrapper.unmount()
  })

  it('should leave a shift-click alone without multiple', async () => {
    const wrapper = mount(Tree, { props: { data } })

    await wrapper.find('[data-key="src"]').trigger('click')
    await wrapper.find('[data-key="readme"]').trigger('click', { shiftKey: true })

    expect(wrapper.emitted('update:modelValue')?.at(-1)?.[0]).toBe('readme')

    wrapper.unmount()
  })

  it('should not open the row a shift-click lands on', async () => {
    const wrapper = mount(Tree, { props: { data, multiple: true } })

    await wrapper.find('[data-key="readme"]').trigger('click')
    await wrapper.find('[data-key="src"]').trigger('click', { shiftKey: true })

    expect(wrapper.find('[data-key="src"]').attributes('aria-expanded')).toBe('false')
    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    wrapper.unmount()
  })

  it('should keep every ancestor chain visible while searching', async () => {
    const wrapper = mount(Tree, { props: { data, filterable: true } })

    await wrapper.find('input').setValue('tree')

    expect(wrapper.emitted('update:searchValue')?.[0]?.[0]).toBe('tree')

    const keys = wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))
    expect(keys).toEqual(['src', 'components', 'tree'])

    wrapper.unmount()
  })

  it('should render the empty slot when nothing matches', async () => {
    const wrapper = mount(Tree, {
      props: { data, filterable: true },
      slots: { empty: 'Nothing here' },
    })

    await wrapper.find('input').setValue('nothing-matches-this')

    expect(wrapper.findAll('[data-tree-item]').length).toBe(0)
    expect(wrapper.text()).toContain('Nothing here')

    wrapper.unmount()
  })
  const remoteForest: TreeOptions = [
    {
      value: 'src',
      label: 'src',
      children: [
        {
          value: 'components',
          label: 'components',
          children: [{ value: 'tree', label: 'tree' }],
        },
      ],
    },
  ]

  it('should render the forest the remote filter resolved to', async () => {
    vi.useFakeTimers()

    const remoteFilter = vi.fn<TreeRemoteFilterFn>(() => Promise.resolve(remoteForest))
    const wrapper = mount(Tree, {
      props: {
        data,
        filterable: true,
        remoteFilter,
        // A local filter that refuses everything still never answers for the query.
        filter: () => false,
      },
    })

    await wrapper.find('input').setValue('  tree  ')

    expect(remoteFilter).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(200)

    expect(remoteFilter).toHaveBeenCalledWith('tree')

    const rows = wrapper.findAll('[data-tree-item]')

    expect(rows.map((row) => row.attributes('data-key'))).toEqual(['src', 'components', 'tree'])
    expect(rows.map((row) => row.attributes('aria-level'))).toEqual(['1', '2', '3'])
    expect(wrapper.find('[data-key="src"]').attributes('aria-expanded')).toBe('true')

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should flatten the returned forest under search-matches-only', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Tree, {
      props: {
        data,
        filterable: true,
        searchMatchesOnly: true,
        remoteFilter: () => Promise.resolve(remoteForest),
      },
    })

    await wrapper.find('input').setValue('tree')
    await vi.advanceTimersByTimeAsync(200)

    const rows = wrapper.findAll('[data-tree-item]')

    expect(rows.map((row) => row.attributes('data-key'))).toEqual(['src', 'components', 'tree'])
    expect(rows.map((row) => row.attributes('aria-level'))).toEqual(['1', '1', '1'])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should show no row and a busy field while the query is in flight', async () => {
    vi.useFakeTimers()

    let settle: ((nodes: TreeOptions) => void) | undefined
    const wrapper = mount(Tree, {
      props: {
        data,
        filterable: true,
        remoteFilter: () =>
          new Promise<TreeOptions>((resolve) => {
            settle = resolve
          }),
      },
    })

    await wrapper.find('input').setValue('tree')

    expect(wrapper.findAll('[data-tree-item]').length).toBe(0)
    expect(
      wrapper.find('[data-tree-search] .pxd-search-input--prefix-icon svg').classes(),
    ).toContain('motion-safe:animate-spin')

    await vi.advanceTimersByTimeAsync(200)

    settle?.(remoteForest)
    await vi.advanceTimersByTimeAsync(0)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should keep only the answer to the latest query', async () => {
    vi.useFakeTimers()

    const settle: ((nodes: TreeOptions) => void)[] = []
    const wrapper = mount(Tree, {
      props: {
        data,
        filterable: true,
        remoteFilter: () =>
          new Promise<TreeOptions>((resolve) => {
            settle.push(resolve)
          }),
      },
    })

    await wrapper.find('input').setValue('tree')
    await vi.advanceTimersByTimeAsync(200)

    await wrapper.find('input').setValue('readme')
    await vi.advanceTimersByTimeAsync(200)

    expect(settle.length).toBe(2)

    // The first answer lands after the query moved on, so it is dropped.
    settle[0]([{ value: 'src', label: 'src' }])
    await vi.advanceTimersByTimeAsync(0)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-tree-item]').length).toBe(0)

    settle[1](remoteForest)
    await vi.advanceTimersByTimeAsync(0)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-tree-item]').map((row) => row.attributes('data-key'))).toEqual([
      'src',
      'components',
      'tree',
    ])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should render no row when the remote filter fails', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Tree, {
      props: {
        data,
        filterable: true,
        remoteFilter: () => Promise.reject(new Error('offline')),
      },
    })

    await wrapper.find('input').setValue('tree')
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-tree-item]').length).toBe(0)

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should keep the local filter when no remote filter is given', async () => {
    const wrapper = mount(Tree, { props: { data, filterable: true } })

    await wrapper.find('input').setValue('tree')

    expect(wrapper.findAll('[data-tree-item]').map((row) => row.attributes('data-key'))).toEqual([
      'src',
      'components',
      'tree',
    ])

    wrapper.unmount()
  })

  it('should go back to the data when the query is cleared', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Tree, {
      props: {
        data,
        filterable: true,
        remoteFilter: () => Promise.resolve(remoteForest),
      },
    })

    await wrapper.find('input').setValue('tree')
    await vi.advanceTimersByTimeAsync(200)
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    await wrapper.find('input').setValue('')

    expect(wrapper.findAll('[data-tree-item]').map((row) => row.attributes('data-key'))).toEqual([
      'src',
      'docs',
      'readme',
    ])

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should move the active node with the keyboard', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data } })

    await wrapper.find('.pxd-tree').trigger('focus')
    await wrapper.find('.pxd-tree').trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.find('[data-key="src"]').attributes('data-active')).toBe('true')
    expect(wrapper.find('.pxd-tree').attributes('aria-activedescendant')).toContain('-0')

    await wrapper.find('.pxd-tree').trigger('keydown', { key: 'ArrowRight' })

    expect(wrapper.findAll('[data-tree-item]').length).toBe(5)

    await wrapper.find('.pxd-tree').trigger('keydown', { key: 'Enter' })

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('src')

    wrapper.unmount()
  })

  it('should keep the active row out of the pointer path', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data } })

    await wrapper.find('[data-key="readme"]').trigger('pointerover')
    await wrapper.find('[data-key="src"]').trigger('click')

    const items = wrapper.findAll('[data-tree-item]')
    expect(items.every((item) => item.attributes('data-active') === 'false')).toBe(true)
    expect(wrapper.find('.pxd-tree').attributes('aria-activedescendant')).toBeUndefined()

    wrapper.unmount()
  })
  it('should hide the active row while the tree is blurred', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data } })

    await wrapper.find('.pxd-tree').trigger('focus')
    await wrapper.find('.pxd-tree').trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.find('[data-key=src]').attributes('data-active')).toBe('true')

    await wrapper.find('.pxd-tree').trigger('blur')

    const active = () => wrapper.find('[data-key=src]').attributes('data-active')
    const tree = () => wrapper.find('.pxd-tree')

    expect(active()).toBe('false')
    expect(tree().attributes('aria-activedescendant')).toBeUndefined()

    await tree().trigger('focus')
    await tree().trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.find('[data-key=readme]').attributes('data-active')).toBe('true')

    wrapper.unmount()
  })

  it('should size the content for the virtual layout', async () => {
    const many = Array.from({ length: 1000 }, (_, index) => ({
      value: 'node-' + index,
      label: 'Node ' + index,
    }))

    const wrapper = mount(Tree, {
      props: { data: many, virtual: true, height: 200, itemSize: 32 },
    })

    await wrapper.vm.$nextTick()

    expect(wrapper.find('.pxd-tree--content').attributes('style')).toContain('height: 32000px')
    expect(wrapper.findAll('[data-tree-item]').length).toBeLessThan(50)

    wrapper.unmount()
  })

  it('should render custom node slots', () => {
    const wrapper = mount(Tree, {
      props: { data },
      slots: {
        'node-icon':
          '<template #node-icon="{ expanded, hasChildren }">{{ hasChildren ? (expanded ? "OPEN" : "SHUT") : "LEAF" }}</template>',
        'node-content':
          '<template #node-content="{ node, hasChildren }"><b>{{ node.label }}</b>{{ hasChildren ? "DIR" : "FILE" }}</template>',
        'node-suffix':
          '<template #node-suffix="{ hasChildren }"><i>{{ hasChildren ? "SUF-DIR" : "SUF-FILE" }}</i></template>',
      },
    })

    expect(wrapper.find('[data-key="src"] .pxd-tree--icon').text()).toBe('SHUT')
    expect(wrapper.find('[data-key="docs"] .pxd-tree--icon').text()).toBe('LEAF')
    expect(wrapper.find('[data-key="src"] b').text()).toBe('src')
    expect(wrapper.find('[data-key="src"] .pxd-tree--content').text()).toBe('srcDIR')
    expect(wrapper.find('[data-key="docs"] .pxd-tree--content').text()).toBe('docsFILE')
    expect(wrapper.find('[data-key="src"] i').text()).toBe('SUF-DIR')
    expect(wrapper.find('[data-key="readme"] i').text()).toBe('SUF-FILE')

    wrapper.unmount()
  })

  it('should expose the source node behind a key', () => {
    const child = { value: 'tree', label: 'tree', extra: 'kept' }
    const wrapper = mount(Tree, {
      props: { data: [{ value: 'src', label: 'src', children: [child] }] },
    })
    const vm = wrapper.vm as unknown as { getData: (value: string) => unknown }

    expect(wrapper.findAll('[data-tree-item]').length).toBe(1)
    expect(vm.getData('tree')).toStrictEqual(child)
    expect(vm.getData('missing')).toBeUndefined()

    wrapper.unmount()
  })

  it('should expose the expand and collapse helpers', async () => {
    const wrapper = mount(Tree, { props: { data } })
    const vm = wrapper.vm as unknown as {
      expandAll: () => void
      collapseAll: () => void
      getVisibleKeys: () => string[]
    }

    expect(vm.getVisibleKeys()).toEqual(['src', 'docs', 'readme'])

    vm.expandAll()
    await wrapper.vm.$nextTick()

    expect(vm.getVisibleKeys().length).toBe(7)

    vm.collapseAll()
    await wrapper.vm.$nextTick()

    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    wrapper.unmount()
  })

  it('should keep one node open per level when accordion is set', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: [
          { value: 'a', label: 'a', children: [{ value: 'a1', label: 'a1' }] },
          { value: 'b', label: 'b', children: [{ value: 'b1', label: 'b1' }] },
        ],
        accordion: true,
      },
    })

    await wrapper.find('[data-key="a"] [data-tree-switcher]').trigger('click')
    await wrapper.find('[data-key="b"] [data-tree-switcher]').trigger('click')

    expect(wrapper.emitted('update:expandedKeys')?.at(-1)?.[0]).toEqual(['b'])
    expect(wrapper.find('[data-key="a"]').attributes('aria-expanded')).toBe('false')
    expect(wrapper.find('[data-key="a1"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should emit node-click with the row it landed on', async () => {
    const wrapper = mount(Tree, { props: { data } })

    await wrapper.find('[data-key="readme"]').trigger('click')

    const [detail, event] = wrapper.emitted('node-click')?.[0] ?? []

    expect(detail).toMatchObject({ value: 'readme', node: { label: 'readme' } })
    expect(event).toBeDefined()

    wrapper.unmount()
  })

  it('should emit node-contextmenu without swallowing the browser menu', async () => {
    const wrapper = mount(Tree, { props: { data } })

    const row = wrapper.find('[data-key="readme"]')

    await row.trigger('contextmenu')

    expect(wrapper.emitted('node-contextmenu')?.[0]?.[0]).toMatchObject({ value: 'readme' })
    expect(wrapper.emitted('node-contextmenu')?.[0]?.[1]).toBeDefined()

    wrapper.unmount()
  })

  it('should return only the leaves when asked', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: [
          {
            value: 'src',
            label: 'src',
            children: [
              { value: 'a', label: 'a' },
              { value: 'b', label: 'b' },
            ],
          },
        ],
        multiple: true,
        modelValue: ['src', 'a', 'b'],
      },
    })
    const vm = wrapper.vm as unknown as { getCheckedKeys: (leafOnly?: boolean) => string[] }

    expect(vm.getCheckedKeys()).toEqual(['src', 'a', 'b'])
    expect(vm.getCheckedKeys(true)).toEqual(['a', 'b'])

    wrapper.unmount()
  })

  it('should read every field through fieldNames', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: [
          {
            id: 'src',
            title: 'src',
            nodes: [{ id: 'components', title: 'components' }],
            off: true,
          },
        ],
        fieldNames: { value: 'id', label: 'title', children: 'nodes', disabled: 'off' },
      },
    })
    const vm = wrapper.vm as unknown as { getData: (value: string) => TreeOption | undefined }

    expect(wrapper.find('[data-key="src"]').attributes('data-disabled')).toBe('true')
    expect(wrapper.find('[data-key="src"] .pxd-tree--content').text()).toBe('src')
    expect(vm.getData('components')?.title).toBe('components')

    await wrapper.find('[data-key="src"] [data-tree-switcher]').trigger('click')

    expect(wrapper.find('[data-key="components"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should read isLeaf through fieldNames', () => {
    const wrapper = mount(Tree, {
      props: {
        data: [{ id: 'docs', title: 'docs', leaf: true }],
        fieldNames: { value: 'id', label: 'title', isLeaf: 'leaf' },
        lazy: true,
        load: () => {},
      },
    })

    expect(wrapper.find('[data-tree-switcher]').exists()).toBe(false)

    wrapper.unmount()
  })

  const ROW_HEIGHT = 32

  function pointer(type: string, x: number, y: number, pointerType = 'mouse') {
    const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent

    Object.defineProperties(event, {
      button: { value: 0 },
      clientX: { value: x },
      clientY: { value: y },
      pointerId: { value: 1 },
      pointerType: { value: pointerType },
    })

    return event
  }

  /** happy-dom has no layout, so the rows are measured by hand. */
  function stubRows(wrapper: any, onRead?: () => void) {
    const items = wrapper.findAll('[data-tree-item]')

    items.forEach((item: any, index: number) => {
      const top = index * ROW_HEIGHT

      Object.defineProperty(item.element, 'getBoundingClientRect', {
        configurable: true,
        value: () => {
          onRead?.()

          return {
            top,
            bottom: top + ROW_HEIGHT,
            height: ROW_HEIGHT,
            left: 0,
            right: 200,
            width: 200,
          }
        },
      })
    })

    const height = items.length * ROW_HEIGHT

    Object.defineProperty(wrapper.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 0, bottom: height, height, left: 0, right: 200, width: 200 }),
    })

    // A list far taller than the rows the pointer walks over, so a move never lands inside its
    // auto-scroll band and no drag test has to wait out a scroll frame.
    stubContainerRect(wrapper, -1000, 1000)
  }

  function stubRect(el: any, top: number, bottom: number) {
    Object.defineProperty(el, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({
        top,
        bottom,
        height: bottom - top,
        left: 0,
        right: 200,
        width: 200,
      }),
    })
  }

  function stubContainerRect(wrapper: any, top: number, bottom: number) {
    stubRect(wrapper.find('[role="tree"]').element, top, bottom)
  }

  function startDrag(wrapper: any, from: string, fromY: number, toY: number) {
    const row = wrapper.find(`[data-key="${from}"]`)

    row.element.dispatchEvent(pointer('pointerdown', 0, fromY))
    row.element.dispatchEvent(pointer('pointermove', 0, toY))

    return row
  }

  it('should let allow-drop overrule the tree and reject a drop', async () => {
    const seen: string[] = []
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data,
        draggable: true,
        allowDrop: ({ targetValue, position }: TreeDropInfo) => {
          seen.push(targetValue + ':' + position)

          return targetValue === 'docs'
        },
      },
    })

    stubRows(wrapper)
    startDrag(wrapper, 'src', 16, 60)

    await wrapper.vm.$nextTick()

    expect(seen.at(-1)).toBe('readme:before')
    expect(wrapper.find('[data-key="docs"]').attributes('data-drop')).toBeUndefined()

    window.dispatchEvent(pointer('pointerup', 0, 60))

    expect(wrapper.emitted('update:data')).toBeUndefined()

    startDrag(wrapper, 'readme', 80, 40)

    await wrapper.vm.$nextTick()

    expect(seen.at(-1)).toBe('docs:before')
    expect(wrapper.find('[data-key="docs"]').attributes('data-drop')).toBe('before')

    window.dispatchEvent(pointer('pointerup', 0, 40))

    const moved = wrapper.emitted('update:data')?.[0]?.[0] as { value: string }[]

    expect(moved.map((node) => node.value)).toEqual(['src', 'readme', 'docs'])

    wrapper.unmount()
  })
  it('should keep the structural rule when allow-drop returns true', async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data,
        draggable: true,
        defaultExpandedKeys: ['src'],
        allowDrop: () => true,
      },
    })

    stubRows(wrapper)
    startDrag(wrapper, 'src', 16, 48)

    await wrapper.vm.$nextTick()

    window.dispatchEvent(pointer('pointerup', 0, 48))

    expect(wrapper.emitted('update:data')).toBeUndefined()

    wrapper.unmount()
  })

  it('should render the drag preview through its slot', async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: { data, draggable: true },
      slots: { 'node-drag-preview': '<span class="preview">{{ params.node.label }}!</span>' },
    })

    stubRows(wrapper)
    startDrag(wrapper, 'docs', 48, 16)

    await wrapper.vm.$nextTick()

    expect(document.querySelector('.preview')?.textContent).toBe('docs!')

    window.dispatchEvent(pointer('pointerup', 0, 16))

    wrapper.unmount()
  })
  it('should emit the next data and the move detail on drop', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'docs', 48, ROW_HEIGHT / 2)

    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-key="src"]').attributes('data-drop')).toBe('inside')

    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2))

    const next = wrapper.emitted('update:data')?.[0]?.[0] as any[]

    expect(next.map((node) => node.value)).toEqual(['src', 'readme'])
    expect(next[0].children.map((node: any) => node.value)).toEqual([
      'components',
      'composables',
      'docs',
    ])

    expect(wrapper.emitted('move')?.[0]?.[0]).toEqual({
      value: 'docs',
      node: { value: 'docs', label: 'docs', disabled: true },
      from: { parentValue: undefined, index: 1 },
      to: {
        parentValue: 'src',
        index: 2,
        targetValue: 'src',
        position: 'inside',
      },
    })

    wrapper.unmount()
  })

  it('should keep the tree untouched when the drop lands nowhere valid', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'readme', 80, 60)

    await wrapper.vm.$nextTick()

    // `docs` is disabled in the fixture, so it is not a destination.
    expect(wrapper.find('[data-key="docs"]').attributes('data-drop')).toBeUndefined()

    window.dispatchEvent(pointer('pointerup', 0, 60))

    expect(wrapper.emitted('update:data')).toBeUndefined()
    expect(wrapper.emitted('move')).toBeUndefined()

    wrapper.unmount()
  })

  it('should open a collapsed parent hovered during a drag', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'docs', 48, ROW_HEIGHT / 2)

    vi.advanceTimersByTime(500)
    await wrapper.vm.$nextTick()

    expect(wrapper.emitted('expand')?.[0]?.[0]).toMatchObject({ value: 'src' })
    expect(wrapper.findAll('[data-tree-item]').length).toBe(5)

    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2))
    vi.useRealTimers()

    wrapper.unmount()
  })

  it('should report the half-checked parents in the change event', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, defaultExpandedKeys: ['src'] },
    })

    await wrapper.find('[data-key="components"] .pxd-tree--checkbox').trigger('click')

    expect(wrapper.emitted('change')?.[0]?.[0]).toEqual({
      value: 'components',
      node: data[0]?.children?.[0],
      checked: true,
      checkedValues: ['components', 'tree', 'list'],
      halfCheckedValues: ['src'],
    })

    wrapper.unmount()
  })

  it('should report no half-checked value without the cascade', async () => {
    const wrapper = mount(Tree, {
      props: { data, multiple: true, checkStrictly: true, defaultExpandedKeys: ['src'] },
    })

    await wrapper.find('[data-key="composables"] .pxd-tree--checkbox').trigger('click')

    const detail = wrapper.emitted('change')?.[0]?.[0] as { halfCheckedValues: string[] }

    expect(detail?.halfCheckedValues).toEqual([])

    wrapper.unmount()
  })

  it('should mark the matched part of a label, and hand it to the content slot', async () => {
    const highlighted = mount(Tree, { props: { data, filterable: true, highlightMatch: true } })

    await highlighted.find('input').setValue('read')

    const marks = highlighted.findAll('[data-key="readme"] .pxd-tree--match')

    expect(marks.map((mark) => mark.text())).toEqual(['read', 'me'])
    expect(marks[0].classes()).toContain('bg-yellow-200')

    highlighted.unmount()

    const custom = mount(Tree, {
      props: { data, filterable: true, highlightMatch: true },
      slots: {
        'node-content':
          '<template #node-content="{ node, parts }"><template v-if="parts"><b v-for="(part, index) in parts" :key="index">{{ part.matched ? "[" + part.text + "]" : part.text }}</b></template><template v-else>{{ node.label }}</template></template>',
      },
    })

    await custom.find('input').setValue('read')

    expect(custom.find('[data-key="readme"] .pxd-tree--content').text()).toBe('[read]me')

    // Without a highlight there is nothing for the slot to draw from.
    await custom.find('input').setValue('')

    expect(custom.find('[data-key="readme"] .pxd-tree--content').text()).toBe('readme')

    custom.unmount()
  })

  it('should draw the node icon only when its slot is given', () => {
    // The glyph belongs to the `node-icon` slot, so without one there is nothing to reserve.
    const withoutSlot = mount(Tree, { props: { data } })

    expect(withoutSlot.findAll('.pxd-tree--icon').length).toBe(0)

    withoutSlot.unmount()

    const withSlot = mount(Tree, {
      props: { data },
      slots: { 'node-icon': '<i data-test="icon" />' },
    })

    expect(withSlot.findAll('.pxd-tree--icon').length).toBe(3)

    withSlot.unmount()
  })

  it('should show only the matched rows when search-matches-only is set', async () => {
    const wrapper = mount(Tree, {
      props: { data, filterable: true, searchMatchesOnly: true },
    })

    await wrapper.find('input').setValue('tree')

    const keys = wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))

    expect(keys).toEqual(['tree'])

    wrapper.unmount()
  })

  it('should keep the filter field out of the tree role', async () => {
    const wrapper = mount(Tree, { props: { data, filterable: true } })
    const tree = wrapper.find('[role=tree]').element

    expect(tree.querySelector('[data-tree-search]')).toBeNull()
    expect(tree.querySelector('input')).toBeNull()
    expect(wrapper.find('[data-tree-search]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should report a parent as expanded while a search shows its children', async () => {
    const wrapper = mount(Tree, {
      props: {
        data: [{ value: 'r', label: 'r', children: [{ value: 'aa', label: 'aa' }] }],
        filterable: true,
      },
    })

    expect(wrapper.find('[data-key="r"]').attributes('aria-expanded')).toBe('false')

    await wrapper.find('input').setValue('aa')

    expect(wrapper.findAll('[data-tree-item]').map((i) => i.attributes('data-key'))).toEqual([
      'r',
      'aa',
    ])
    expect(wrapper.find('[data-key="r"]').attributes('aria-expanded')).toBe('true')

    await wrapper.find('input').setValue('')

    expect(wrapper.find('[data-key="r"]').attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('should take the search value from the prop when one is given', async () => {
    const wrapper = mount(Tree, {
      props: { data, filterable: true, searchValue: 'tree' },
    })

    expect(wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))).toEqual([
      'src',
      'components',
      'tree',
    ])

    // A controlled field ignores the input: the owner writes it back.
    await wrapper.find('input').setValue('docs')

    expect(wrapper.emitted('update:searchValue')?.[0]?.[0]).toBe('docs')
    expect(wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))).toEqual([
      'src',
      'components',
      'tree',
    ])

    await wrapper.setProps({ searchValue: '' })

    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    wrapper.unmount()
  })

  it('should start from default-search-value', () => {
    const wrapper = mount(Tree, {
      props: { data, filterable: true, defaultSearchValue: 'tree' },
    })

    expect(wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))).toEqual([
      'src',
      'components',
      'tree',
    ])

    wrapper.unmount()
  })

  it('should mark a disabled node with aria-disabled', () => {
    const wrapper = mount(Tree, { props: { data } })

    expect(wrapper.find('[data-key="docs"]').attributes('aria-disabled')).toBe('true')
    expect(wrapper.find('[data-key="readme"]').attributes('aria-disabled')).toBeUndefined()

    wrapper.unmount()
  })

  it('should report checked keys that sit inside a collapsed subtree', async () => {
    const nested = [
      {
        value: 'src',
        label: 'src',
        children: [
          { value: 'a', label: 'a' },
          { value: 'b', label: 'b' },
        ],
      },
    ]
    const wrapper = mount(Tree, {
      props: {
        data: nested,
        multiple: true,
        defaultExpandedKeys: ['src'],
        modelValue: ['a'],
      },
    })
    const vm = wrapper.vm as unknown as {
      getCheckedKeys: (leafOnly?: boolean, includeIndeterminate?: boolean) => string[]
    }

    expect(vm.getCheckedKeys()).toEqual(['a'])

    await wrapper.setProps({ expandedKeys: [] })

    expect(wrapper.findAll('[data-tree-item]').map((i) => i.attributes('data-key'))).toEqual([
      'src',
    ])
    expect(vm.getCheckedKeys()).toEqual(['a'])
    expect(vm.getCheckedKeys(false, true)).toEqual(['src', 'a'])

    wrapper.unmount()
  })

  it('should keep the flat rows untouched when only the selection moves', async () => {
    const many = Array.from({ length: 50 }, (_, i) => ({ value: 'n' + i, label: 'n' + i }))
    const wrapper = mount(Tree, {
      props: { data: many, multiple: true, defaultExpandedKeys: [], modelValue: [] },
    })

    await wrapper.find('[data-key="n1"] .pxd-tree--checkbox').trigger('click')
    await wrapper.setProps({ modelValue: ['n1'] })

    expect(wrapper.find('[data-key="n1"]').attributes('data-checked')).toBe('true')
    expect(wrapper.find('[data-key="n0"]').attributes('data-checked')).toBe('false')

    wrapper.unmount()
  })

  it('should keep the ancestor chain without search-matches-only', async () => {
    const wrapper = mount(Tree, { props: { data, filterable: true } })

    await wrapper.find('input').setValue('tree')

    const keys = wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))

    expect(keys).toEqual(['src', 'components', 'tree'])

    wrapper.unmount()
  })

  it('should measure each row once while the pointer moves', async () => {
    const many = Array.from({ length: 120 }, (_, index) => ({
      value: 'node-' + index,
      label: 'Node ' + index,
    }))

    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: { data: many, draggable: true },
    })

    let reads = 0

    stubRows(wrapper, () => reads++)

    const row = wrapper.find('[data-key="node-0"]')

    row.element.dispatchEvent(pointer('pointerdown', 0, 4))
    // The first move past the threshold pays for the one-off measurement of the whole list.
    row.element.dispatchEvent(pointer('pointermove', 0, 100))
    expect(reads).toBeGreaterThanOrEqual(many.length)

    for (const y of [160, 240, 400, 1200, 5000, 1000]) {
      reads = 0
      row.element.dispatchEvent(pointer('pointermove', 0, y))
      expect(reads).toBeLessThanOrEqual(1)
    }

    window.dispatchEvent(pointer('pointerup', 0, 1000))

    wrapper.unmount()
  }, 10000)

  it('should cancel a drag on Escape', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'docs', 48, ROW_HEIGHT / 2)

    const event = new KeyboardEvent('keydown', { key: 'Escape', cancelable: true })

    window.dispatchEvent(event)
    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2))

    expect(event.defaultPrevented).toBe(true)
    expect(wrapper.emitted('update:data')).toBeUndefined()

    wrapper.unmount()
  })

  it('should ignore the pointer while a search hides part of the tree', async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: { data, draggable: true, filterable: true },
    })

    await wrapper.find('input').setValue('docs')

    stubRows(wrapper)
    startDrag(wrapper, 'docs', 48, ROW_HEIGHT / 2)
    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2))

    expect(wrapper.emitted('update:data')).toBeUndefined()

    wrapper.unmount()
  })

  it('should read a touch that moves at once as a scroll', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)

    const row = wrapper.find('[data-key="docs"]')

    row.element.dispatchEvent(pointer('pointerdown', 0, 48, 'touch'))
    row.element.dispatchEvent(pointer('pointermove', 0, ROW_HEIGHT / 2, 'touch'))

    await wrapper.vm.$nextTick()
    expect(row.attributes('data-dragging')).toBe('false')

    // The press belonged to the page, so the scrolling this finger starts is left to it.
    const scroll = new Event('touchmove', { cancelable: true })

    window.dispatchEvent(scroll)
    expect(scroll.defaultPrevented).toBe(false)

    vi.advanceTimersByTime(500)
    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2, 'touch'))

    expect(wrapper.emitted('update:data')).toBeUndefined()

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should drag a touch once it has held still', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)

    const row = wrapper.find('[data-key="docs"]')

    row.element.dispatchEvent(pointer('pointerdown', 0, 48, 'touch'))
    vi.advanceTimersByTime(300)

    await wrapper.vm.$nextTick()
    expect(row.attributes('data-dragging')).toBe('true')

    // From here the page must not scroll under the finger.
    const scroll = new Event('touchmove', { cancelable: true })

    window.dispatchEvent(scroll)
    expect(scroll.defaultPrevented).toBe(true)

    row.element.dispatchEvent(pointer('pointermove', 0, ROW_HEIGHT / 2, 'touch'))

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-key="src"]').attributes('data-drop')).toBe('inside')

    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2, 'touch'))

    expect(wrapper.emitted('update:data')?.length).toBe(1)

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should resolve the drop against the row the pointer is left over after a scroll', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'src', 16, 80)

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-key="readme"]').attributes('data-drop')).toBe('after')

    // The page scrolls up under a pointer that never moved, so another row sits under it now.
    stubContainerRect(wrapper, -960, 1040)
    window.dispatchEvent(new Event('scroll'))

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-key="readme"]').attributes('data-drop')).toBeUndefined()

    window.dispatchEvent(pointer('pointerup', 0, 80))

    wrapper.unmount()
  })

  it('should leave the scrolling to the browser', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)

    const container = wrapper.find('[role="tree"]')
    const written: number[] = []

    Object.defineProperty(container.element, 'scrollTop', {
      configurable: true,
      get: () => 0,
      set: (value: number) => written.push(value),
    })
    stubContainerRect(wrapper, 0, 100)

    // Dragged right into the edge of the list: nothing scrolls unless the user scrolls it.
    startDrag(wrapper, 'docs', 48, 96)
    await wrapper.vm.$nextTick()
    expect(written).toEqual([])

    wrapper.find('[data-key="docs"]').element.dispatchEvent(pointer('pointermove', 0, 50))
    expect(written).toEqual([])

    window.dispatchEvent(pointer('pointerup', 0, 50))

    wrapper.unmount()
  })

  it('should only nest into a childless row when drop-inside-leaf is set', async () => {
    const off = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(off)
    startDrag(off, 'docs', 48, 80)

    await off.vm.$nextTick()
    expect(off.find('[data-key="readme"]').attributes('data-drop')).toBe('after')

    off.unmount()

    const on = mount(Tree, {
      attachTo: document.body,
      props: { data, draggable: true, dropInsideLeaf: true },
    })

    stubRows(on)
    startDrag(on, 'docs', 48, 80)

    await on.vm.$nextTick()
    expect(on.find('[data-key="readme"]').attributes('data-drop')).toBe('inside')

    window.dispatchEvent(pointer('pointerup', 0, 80))

    const next = on.emitted('update:data')?.[0]?.[0] as {
      value: string
      children: { value: string }[]
    }[]

    expect(next.map((node) => node.value)).toEqual(['src', 'readme'])
    expect(next[1].children.map((node) => node.value)).toEqual(['docs'])
    expect(on.emitted('move')?.[0]?.[0]).toMatchObject({
      value: 'docs',
      from: { parentValue: undefined, index: 1 },
      to: { parentValue: 'readme', index: 0, targetValue: 'readme', position: 'inside' },
    })

    on.unmount()
  })

  it('should not open a childless row the drag hovers', async () => {
    vi.useFakeTimers()

    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: { data, draggable: true, dropInsideLeaf: true },
    })

    stubRows(wrapper)
    startDrag(wrapper, 'docs', 48, 80)

    vi.advanceTimersByTime(500)

    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('expand')).toBeUndefined()

    window.dispatchEvent(pointer('pointerup', 0, 80))

    vi.useRealTimers()
    wrapper.unmount()
  })

  it('should spell a gap between rows with the row below it', async () => {
    const seen: string[] = []
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data,
        draggable: true,
        defaultExpandedKeys: ['src'],
        allowDrop: ({ targetValue, position }: TreeDropInfo) => {
          seen.push(targetValue + ':' + position)

          return true
        },
      },
    })

    stubRows(wrapper)

    const at = (key: string) => wrapper.find(`[data-key="${key}"]`)
    const move = (y: number) => {
      at('readme').element.dispatchEvent(pointer('pointermove', 0, y))

      return wrapper.vm.$nextTick()
    }

    startDrag(wrapper, 'readme', 144, 28)
    await wrapper.vm.$nextTick()

    // Past `src` and its children there is only one slot left, and `docs` three rows down is the
    // row that owns it.
    expect(seen.at(-1)).toBe('docs:before')
    expect(at('src').attributes('data-drop')).toBeUndefined()
    expect(at('docs').attributes('data-drop')).toBe('before')

    // As `src`'s own first child, on the child's own half.
    await move(36)
    expect(at('components').attributes('data-drop')).toBe('before')

    // Both halves of a gap name the row under it, so the lower one keeps it either way.
    await move(60)
    expect(at('composables').attributes('data-drop')).toBe('before')

    await move(68)
    expect(at('components').attributes('data-drop')).toBeUndefined()
    expect(at('composables').attributes('data-drop')).toBe('before')

    // Last at its own level, with no sibling below to say it instead, so it keeps an `after`.
    await move(92)
    expect(at('composables').attributes('data-drop')).toBe('after')

    await move(100)
    expect(at('composables').attributes('data-drop')).toBeUndefined()
    expect(at('docs').attributes('data-drop')).toBe('before')

    // The middle of a row that can take children outlines the row instead.
    await move(48)
    expect(at('components').attributes('data-drop')).toBe('inside')
    expect(at('components').classes()).toEqual(
      expect.arrayContaining(['ring-1', 'ring-primary', 'bg-gray-300']),
    )

    window.dispatchEvent(pointer('pointerup', 0, 48))

    wrapper.unmount()
  })

  it('should open the row that just took a child', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'readme', 80, 16)

    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-key="src"]').attributes('data-drop')).toBe('inside')

    window.dispatchEvent(pointer('pointerup', 0, 16))

    const next = wrapper.emitted('update:data')?.[0]?.[0] as typeof data

    await wrapper.setProps({ data: next })

    expect(wrapper.emitted('expand')?.[0]?.[0]).toMatchObject({ value: 'src' })
    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual(['src'])
    expect(wrapper.find('[data-key="src"]').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[data-tree-item]').length).toBe(5)
    wrapper.unmount()
  })

  it('should let a child drop below its parent as a sibling', async () => {
    const single = [
      {
        value: 'root',
        label: 'root',
        children: [
          { value: 'a', label: 'a' },
          { value: 'b', label: 'b' },
        ],
      },
    ]
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: { data: single, draggable: true, defaultExpandedKeys: ['root'] },
    })

    stubRows(wrapper)

    startDrag(wrapper, 'b', 80, 28)
    await wrapper.vm.$nextTick()
    expect(wrapper.find('[data-key="root"]').attributes('data-drop')).toBe('after')

    window.dispatchEvent(pointer('pointerup', 0, 28))

    const next = wrapper.emitted('update:data')?.[0]?.[0] as { value: string }[]

    expect(next.map((node) => node.value)).toEqual(['root', 'b'])
    expect(wrapper.emitted('move')?.[0]?.[0]).toMatchObject({
      value: 'b',
      from: { parentValue: 'root', index: 1 },
      to: { parentValue: undefined, index: 1, targetValue: 'root', position: 'after' },
    })

    wrapper.unmount()
  })

  it('should not select the row a drag was released on', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'readme', 80, 16)
    window.dispatchEvent(pointer('pointerup', 0, 16))

    // The browser fires a click of its own after the gesture, on the row the press started from.
    await wrapper.find('[data-key="readme"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()

    // Without a drag in front of it, the same row still selects.
    wrapper.find('[data-key="readme"]').element.dispatchEvent(pointer('pointerdown', 0, 80))
    window.dispatchEvent(pointer('pointerup', 0, 80))
    await wrapper.find('[data-key="readme"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('readme')

    wrapper.unmount()
  })

  it('should cover the tree with a loading mask and ignore the keyboard', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, loading: true } })

    expect(wrapper.find('.pxd-loading-mask').exists()).toBe(true)
    expect(wrapper.find('.pxd-tree').attributes('aria-busy')).toBe('true')
    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    await wrapper.find('.pxd-tree').trigger('focus')
    await wrapper.find('.pxd-tree').trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.find('[data-key="src"]').attributes('data-active')).toBe('false')

    await wrapper.setProps({ loading: false })

    expect(wrapper.find('.pxd-loading-mask').exists()).toBe(false)
    expect(wrapper.find('.pxd-tree').attributes('aria-busy')).toBe('false')

    await wrapper.find('.pxd-tree').trigger('keydown', { key: 'ArrowDown' })

    expect(wrapper.find('[data-key="src"]').attributes('data-active')).toBe('true')

    wrapper.unmount()
  })

  it('should hide the empty slot and keep the mask readable while loading without rows', async () => {
    const wrapper = mount(Tree, {
      props: { data: [], loading: true },
      slots: { empty: 'Nothing here' },
    })

    expect(wrapper.text()).not.toContain('Nothing here')
    expect(wrapper.find('.pxd-loading-mask').exists()).toBe(true)
    expect(wrapper.find('.pxd-tree').classes()).toContain('min-h-22')

    await wrapper.setProps({ loading: false })

    expect(wrapper.text()).toContain('Nothing here')
    expect(wrapper.find('.pxd-tree').classes()).not.toContain('min-h-22')

    wrapper.unmount()
  })

  it('should hand the loading state to the built-in search field', async () => {
    const wrapper = mount(Tree, { props: { data, filterable: true, loading: true } })
    const icon = () => wrapper.find('[data-tree-search] .pxd-search-input--prefix-icon svg')

    expect(icon().classes()).toContain('motion-safe:animate-spin')

    await wrapper.setProps({ loading: false })

    expect(icon().classes()).not.toContain('motion-safe:animate-spin')

    wrapper.unmount()
  })

  it('should ignore the search field while loading', async () => {
    const wrapper = mount(Tree, { props: { data, filterable: true, loading: true } })
    const keys = () =>
      wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))

    await wrapper.find('input').setValue('tree')

    expect(wrapper.emitted('update:searchValue')).toBeUndefined()
    expect(keys()).toEqual(['src', 'docs', 'readme'])

    await wrapper.setProps({ loading: false })
    await wrapper.find('input').setValue('tree')

    expect(wrapper.emitted('update:searchValue')?.[0]?.[0]).toBe('tree')
    expect(keys()).toEqual(['src', 'components', 'tree'])

    wrapper.unmount()
  })

  const lazyData = [{ value: 'src', label: 'src' }]

  it('should load the children of a node the first time it opens', async () => {
    const load = vi.fn<TreeLoadFn>((detail, resolve) => {
      resolve([{ value: detail.node.value + '/tree', label: 'tree' }])
    })
    const wrapper = mount(Tree, { props: { data: lazyData, lazy: true, load } })

    expect(wrapper.findAll('[data-tree-item]').length).toBe(1)
    expect(wrapper.find('[data-tree-switcher]').exists()).toBe(true)

    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(load).toHaveBeenCalledTimes(1)
    expect(load.mock.calls[0]?.[0]).toMatchObject({
      node: { value: 'src' },
      depth: 0,
      parent: undefined,
    })
    expect(wrapper.find('[data-key="src"]').attributes('aria-expanded')).toBe('true')
    expect(wrapper.findAll('[data-tree-item]').length).toBe(2)
    expect(wrapper.find('[data-key="src/tree"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should ask a node for its children only once', async () => {
    const load = vi.fn<TreeLoadFn>((_detail, resolve) => {
      resolve([{ value: 'components', label: 'components' }])
    })
    const wrapper = mount(Tree, { props: { data: lazyData, lazy: true, load } })

    await wrapper.find('[data-tree-switcher]').trigger('click')
    await wrapper.find('[data-tree-switcher]').trigger('click')
    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('[data-tree-item]').length).toBe(2)

    wrapper.unmount()
  })

  it('should mark the row as busy while its children are on their way', async () => {
    let settle: ((children: TreeOption[]) => void) | undefined
    const load = vi.fn<TreeLoadFn>((_detail, resolve) => {
      settle = resolve
    })
    const wrapper = mount(Tree, { props: { data: lazyData, lazy: true, load } })

    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(wrapper.find('[data-key="src"]').attributes('aria-busy')).toBe('true')
    expect(wrapper.find('[data-tree-switcher] svg').classes()).toContain('motion-safe:animate-spin')

    settle?.([{ value: 'components', label: 'components' }])
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-key="src"]').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.findAll('[data-tree-item]').length).toBe(2)

    wrapper.unmount()
  })

  it('should turn a node into a leaf when its request came back empty', async () => {
    const load = vi.fn<TreeLoadFn>((_detail, resolve) => resolve([]))
    const wrapper = mount(Tree, { props: { data: lazyData, lazy: true, load } })

    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.find('[data-key="src"]').attributes('aria-expanded')).toBeUndefined()
    expect(wrapper.find('[data-tree-switcher]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should expand and collapse a parent whose children are empty', async () => {
    const wrapper = mount(Tree, {
      props: { data: [{ value: 'empty', label: 'empty', isLeaf: false }] },
    })

    expect(wrapper.find('[data-tree-switcher]').exists()).toBe(true)

    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(wrapper.find('[data-key="empty"]').attributes('aria-expanded')).toBe('true')

    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(wrapper.find('[data-key="empty"]').attributes('aria-expanded')).toBe('false')

    wrapper.unmount()
  })

  it('should treat an empty children array as a leaf', () => {
    const wrapper = mount(Tree, {
      props: { data: [{ value: 'empty', label: 'empty', children: [] }] },
    })

    expect(wrapper.find('[data-tree-switcher]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should let isLeaf outrank the data', async () => {
    const load = vi.fn<TreeLoadFn>((_detail, resolve) => resolve([]))
    const wrapper = mount(Tree, {
      props: {
        data: [
          { value: 'leaf', label: 'leaf', isLeaf: true, children: [] },
          {
            value: 'stale',
            label: 'stale',
            isLeaf: true,
            children: [{ value: 'child', label: 'child' }],
          },
          { value: 'empty', label: 'empty', isLeaf: false },
        ],
        lazy: true,
        load,
      },
    })

    expect(wrapper.find('[data-key="leaf"] [data-tree-switcher]').exists()).toBe(false)
    expect(wrapper.find('[data-key="stale"] [data-tree-switcher]').exists()).toBe(false)
    expect(wrapper.find('[data-key="empty"] [data-tree-switcher]').exists()).toBe(true)

    await wrapper.find('[data-key="leaf"]').trigger('click')

    expect(load).not.toHaveBeenCalled()
    expect(wrapper.find('[data-key="child"]').exists()).toBe(false)

    wrapper.unmount()
  })

  it('should open a lazy tree level by level when expanding all', async () => {
    const load = vi.fn<TreeLoadFn>((detail, resolve) => {
      if (detail.depth === 0) {
        resolve([{ value: 'components', label: 'components' }])
        return
      }

      resolve(detail.depth === 1 ? [{ value: 'tree', label: 'tree' }] : [])
    })
    const wrapper = mount(Tree, { props: { data: lazyData, lazy: true, load } })
    const vm = wrapper.vm as unknown as {
      expandAll: () => void
      getVisibleKeys: () => string[]
    }

    vm.expandAll()

    for (let i = 0; i < 6; i++) {
      await wrapper.vm.$nextTick()
    }

    expect(load.mock.calls.map((call) => (call[0].node as TreeOption).value)).toEqual([
      'src',
      'components',
      'tree',
    ])
    expect(vm.getVisibleKeys()).toEqual(['src', 'components', 'tree'])

    wrapper.unmount()
  })

  it('should keep an unloaded node expandable when the request fails', async () => {
    const load = vi.fn<TreeLoadFn>((_detail, _resolve, reject) => reject())
    const wrapper = mount(Tree, { props: { data: lazyData, lazy: true, load } })

    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(wrapper.find('[data-key="src"]').attributes('aria-busy')).toBeUndefined()
    expect(wrapper.findAll('[data-tree-item]').length).toBe(1)

    await wrapper.find('[data-tree-switcher]').trigger('click')
    await wrapper.find('[data-tree-switcher]').trigger('click')

    expect(load).toHaveBeenCalledTimes(2)

    wrapper.unmount()
  })

  it('should load the nodes that start out expanded', async () => {
    const load = vi.fn<TreeLoadFn>((_detail, resolve) => {
      resolve([{ value: 'components', label: 'components' }])
    })
    const wrapper = mount(Tree, {
      props: { data: lazyData, lazy: true, load, defaultExpandedKeys: ['src'] },
    })

    expect(load).toHaveBeenCalledTimes(1)
    expect(wrapper.findAll('[data-tree-item]').length).toBe(2)

    wrapper.unmount()
  })

  it('should load a key that only shows up below a node still on its way', async () => {
    const load = vi.fn<TreeLoadFn>((detail, resolve) => {
      resolve(
        detail.node.value === 'src'
          ? [{ value: 'components', label: 'components' }]
          : [{ value: 'tree', label: 'tree' }],
      )
    })
    const wrapper = mount(Tree, {
      props: {
        data: lazyData,
        lazy: true,
        load,
        defaultExpandedKeys: ['src', 'components'],
      },
    })

    expect(load.mock.calls.map((call) => call[0])).toMatchObject([
      { node: { value: 'src' }, depth: 0, parent: undefined },
      { node: { value: 'components' }, depth: 1, parent: { value: 'src' } },
    ])
    expect(wrapper.find('[data-key="tree"]').exists()).toBe(true)

    wrapper.unmount()
  })

  it('should leave a node the data or its own flag settles alone', async () => {
    const load = vi.fn<TreeLoadFn>((_detail, resolve) => resolve([]))
    const wrapper = mount(Tree, {
      props: {
        data: [
          { value: 'src', label: 'src', children: [{ value: 'tree', label: 'tree' }] },
          { value: 'docs', label: 'docs', isLeaf: true },
        ],
        lazy: true,
        load,
      },
    })

    await wrapper.find('[data-key="src"] [data-tree-switcher]').trigger('click')

    expect(load).not.toHaveBeenCalled()
    expect(wrapper.find('[data-key="docs"] [data-tree-switcher]').exists()).toBe(false)
    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

    wrapper.unmount()
  })

  it('should refuse to nest into a parent whose children were never loaded', async () => {
    const load = vi.fn<TreeLoadFn>(() => {})
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data: [
          { value: 'src', label: 'src' },
          { value: 'file', label: 'file' },
        ],
        lazy: true,
        draggable: true,
        load,
      },
    })

    stubRows(wrapper)
    startDrag(wrapper, 'file', 48, 16)
    await wrapper.vm.$nextTick()

    expect(wrapper.find('[data-key="src"]').attributes('data-drop')).toBeUndefined()
    expect(load).not.toHaveBeenCalled()

    window.dispatchEvent(pointer('pointerup', 0, 16))

    expect(wrapper.emitted('update:data')).toBeUndefined()

    wrapper.unmount()
  })

  it('should carry the loaded subtrees in the tree a drop proposes', async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: {
        data: lazyData,
        lazy: true,
        draggable: true,
        load: vi.fn<TreeLoadFn>((_detail, resolve) => {
          resolve([{ value: 'file', label: 'file' }])
        }),
      },
    })

    await wrapper.find('[data-tree-switcher]').trigger('click')

    // Below the middle of `src`, so the gap under it is the drop the pointer asks for.
    stubRows(wrapper)
    startDrag(wrapper, 'file', 48, 30)
    window.dispatchEvent(pointer('pointerup', 0, 30))

    const next = wrapper.emitted('update:data')?.[0]?.[0] as TreeOption[]

    expect(next.map((node) => node.value)).toEqual(['src', 'file'])

    wrapper.unmount()
  })
})
