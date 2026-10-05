import type { TreeDropInfo } from '../../src/components/tree/types'
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

  it('should select and expand a parent row in single mode', async () => {
    const wrapper = mount(Tree, { props: { data } })

    await wrapper.find('[data-key=src]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('src')
    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual(['src'])
    expect(wrapper.findAll('[data-tree-item]').length).toBe(5)

    wrapper.unmount()
  })

  it('should keep a parent row expansion-only in multiple mode', async () => {
    const wrapper = mount(Tree, { props: { data, multiple: true } })

    await wrapper.find('[data-key=src]').trigger('click')

    expect(wrapper.emitted('update:modelValue')).toBeUndefined()
    expect(wrapper.emitted('update:expandedKeys')?.[0]?.[0]).toEqual(['src'])

    wrapper.unmount()
  })

  it('should check the node row when expandOnClick is false', async () => {
    const wrapper = mount(Tree, { props: { data, expandOnClick: false } })

    await wrapper.find('[data-key="readme"]').trigger('click')

    expect(wrapper.emitted('update:modelValue')?.[0]?.[0]).toBe('readme')
    expect(wrapper.findAll('[data-tree-item]').length).toBe(3)

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
          '<template #node-icon="{ expanded }">{{ expanded ? "OPEN" : "SHUT" }}</template>',
        'node-content': '<template #node-content="{ node }"><b>{{ node.label }}</b></template>',
      },
    })

    expect(wrapper.text()).toContain('SHUT')
    expect(wrapper.find('[data-key="src"] b').text()).toBe('src')

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

  const ROW_HEIGHT = 32

  function pointer(type: string, x: number, y: number) {
    const event = new Event(type, { bubbles: true, cancelable: true }) as PointerEvent

    Object.defineProperties(event, {
      button: { value: 0 },
      clientX: { value: x },
      clientY: { value: y },
      pointerId: { value: 1 },
      pointerType: { value: 'mouse' },
    })

    return event
  }

  /** happy-dom has no layout, so the rows are measured by hand. */
  function stubRows(wrapper: any) {
    const items = wrapper.findAll('[data-tree-item]')

    items.forEach((item: any, index: number) => {
      const top = index * ROW_HEIGHT

      Object.defineProperty(item.element, 'getBoundingClientRect', {
        configurable: true,
        value: () => ({
          top,
          bottom: top + ROW_HEIGHT,
          height: ROW_HEIGHT,
          left: 0,
          right: 200,
          width: 200,
        }),
      })
    })

    const height = items.length * ROW_HEIGHT

    Object.defineProperty(wrapper.element, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ top: 0, bottom: height, height, left: 0, right: 200, width: 200 }),
    })
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

          // `docs` is disabled in the fixture, so the tree refuses it on its own.
          return targetValue === 'docs'
        },
      },
    })

    stubRows(wrapper)
    startDrag(wrapper, 'src', 16, 60)

    await wrapper.vm.$nextTick()

    expect(seen).toEqual(['docs:after'])
    expect(wrapper.find('[data-key="docs"]').attributes('data-drop')).toBe('after')

    window.dispatchEvent(pointer('pointerup', 0, 60))

    const moved = wrapper.emitted('update:data')?.[0]?.[0] as { value: string }[]

    expect(moved.map((node) => node.value)).toEqual(['docs', 'src', 'readme'])

    stubRows(wrapper)
    startDrag(wrapper, 'readme', 80, 16)

    await wrapper.vm.$nextTick()

    expect(seen).toEqual(['docs:after', 'src:inside'])
    expect(wrapper.find('[data-key="src"]').attributes('data-drop')).toBeUndefined()

    window.dispatchEvent(pointer('pointerup', 0, 16))

    expect(wrapper.emitted('update:data')?.length).toBe(1)

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

  it('should hide the node icon when show-icon is off', () => {
    const on = mount(Tree, { props: { data } })

    expect(on.findAll('.pxd-tree--icon').length).toBe(3)

    on.unmount()

    const off = mount(Tree, { props: { data, showIcon: false } })

    expect(off.findAll('.pxd-tree--icon').length).toBe(0)

    off.unmount()
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

  it('should keep the ancestor chain without search-matches-only', async () => {
    const wrapper = mount(Tree, { props: { data, filterable: true } })

    await wrapper.find('input').setValue('tree')

    const keys = wrapper.findAll('[data-tree-item]').map((item) => item.attributes('data-key'))

    expect(keys).toEqual(['src', 'components', 'tree'])

    wrapper.unmount()
  })

  it('should cancel a drag on Escape', async () => {
    const wrapper = mount(Tree, { attachTo: document.body, props: { data, draggable: true } })

    stubRows(wrapper)
    startDrag(wrapper, 'docs', 48, ROW_HEIGHT / 2)

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2))

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

  it('should drag from the handle alone when a handle slot is given', async () => {
    const wrapper = mount(Tree, {
      attachTo: document.body,
      props: { data, draggable: true },
      slots: { 'node-drag-handle': '<span class="grip">..</span>' },
    })

    expect(wrapper.findAll('[data-tree-drag-handle]').length).toBe(3)

    stubRows(wrapper)

    const row = startDrag(wrapper, 'docs', 48, ROW_HEIGHT / 2)
    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2))

    expect(wrapper.emitted('update:data')).toBeUndefined()

    const handle = row.find('[data-tree-drag-handle]')

    handle.element.dispatchEvent(pointer('pointerdown', 0, 48))
    handle.element.dispatchEvent(pointer('pointermove', 0, ROW_HEIGHT / 2))
    window.dispatchEvent(pointer('pointerup', 0, ROW_HEIGHT / 2))

    expect(wrapper.emitted('update:data')?.length).toBe(1)

    wrapper.unmount()
  })
})
