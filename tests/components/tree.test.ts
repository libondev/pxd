import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vite-plus/test'
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
})
