import type { TreeOption, TreeOptions } from '../../src/components/tree/types'
import type { ComponentValue } from '../../src/types/shared/props'
import { describe, expect, it } from 'vite-plus/test'
import {
  createTreeIndex,
  graftLoadedChildren,
  moveTreeNode,
} from '../../src/composables/_internal/use-tree'

const indexData = [
  {
    value: 'a',
    children: [{ value: 'a-1' }, { value: 'a-2' }],
  },
  { value: 'b' },
]

describe('createTreeIndex', () => {
  it('should walk the tree in document order with depths', () => {
    const { list } = createTreeIndex(indexData, {})

    expect(list.map((meta) => meta.node.value)).toEqual(['a', 'a-1', 'a-2', 'b'])
    expect(list.map((meta) => meta.depth)).toEqual([0, 1, 1, 0])
    expect(list.map((meta) => meta.parentValue)).toEqual([undefined, 'a', 'a', undefined])
  })

  it('should mark the exclusive end of every subtree', () => {
    const { list } = createTreeIndex(indexData, {})

    expect(list.map((meta) => meta.end)).toEqual([3, 2, 3, 4])
  })

  it('should read children from a custom field', () => {
    const { list } = createTreeIndex([{ value: 'root', nodes: [{ value: 'child' }] }], {
      children: 'nodes',
    })

    expect(list.map((meta) => meta.node.value)).toEqual(['root', 'child'])
  })

  it('should keep an entry without children addressable', () => {
    const { byValue } = createTreeIndex(indexData, {})

    expect(byValue.get('a-2')?.children.length).toBe(0)
  })
})

const data: TreeOptions = [
  {
    value: 'src',
    label: 'src',
    children: [
      { value: 'components', label: 'components' },
      { value: 'composables', label: 'composables' },
    ],
  },
  { value: 'docs', label: 'docs' },
]

function loaded(entries: [ComponentValue, TreeOptions][]): Map<ComponentValue, TreeOptions> {
  return new Map(entries)
}

describe('graftLoadedChildren', () => {
  const tree: TreeOptions = [
    { value: 'src', children: [{ value: 'components' }] },
    { value: 'docs' },
  ]

  it('should hand back the very same data while nothing was loaded', () => {
    expect(graftLoadedChildren(tree, loaded([]), {})).toBe(tree)
  })

  it('should graft children under the node that resolved them', () => {
    const result = graftLoadedChildren(tree, loaded([['docs', [{ value: 'guide' }]]]), {})

    expect(keysOf(result[1])).toEqual(['guide'])
    expect(result[0]).toBe(tree[0])

    // The caller's own data is never written to.
    expect(tree[1]?.children).toBeUndefined()
  })

  it('should keep the children the data already carries', () => {
    const result = graftLoadedChildren(tree, loaded([['src', [{ value: 'other' }]]]), {})

    expect(keysOf(result[0])).toEqual(['components'])
  })

  it('should graft into a subtree loaded earlier', () => {
    const result = graftLoadedChildren(
      [{ value: 'src' }],
      loaded([
        ['src', [{ value: 'components' }]],
        ['components', [{ value: 'tree' }]],
      ]),
    )

    expect(keysOf(result[0])).toEqual(['components'])
    expect(keysOf(result[0]?.children?.[0])).toEqual(['tree'])
  })

  it('should spell out a node that resolved with no children', () => {
    const result = graftLoadedChildren([{ value: 'docs' }], loaded([['docs', []]]), {})

    expect(result[0]?.children).toEqual([])
  })
})

function keys(list: TreeOption[]): unknown[] {
  return list.map((node) => node.value)
}

function keysOf(node: TreeOption | undefined): unknown[] {
  return Array.isArray(node?.children) ? keys(node.children) : []
}

describe('moveTreeNode', () => {
  it('should move a node between the root and a subtree', () => {
    const result = moveTreeNode(data, {}, 'docs', {
      targetValue: 'src',
      position: 'inside',
    })

    expect(keys(result?.data ?? [])).toEqual(['src'])
    expect(keysOf(result?.data[0])).toEqual(['components', 'composables', 'docs'])
    expect(result?.detail).toEqual({
      value: 'docs',
      node: { value: 'docs', label: 'docs' },
      from: { parentValue: undefined, index: 1 },
      to: {
        parentValue: 'src',
        index: 2,
        targetValue: 'src',
        position: 'inside',
      },
    })
  })

  it('should reorder siblings', () => {
    const result = moveTreeNode(data, {}, 'docs', {
      targetValue: 'src',
      position: 'before',
    })

    expect(keys(result?.data ?? [])).toEqual(['docs', 'src'])
    expect(result?.detail.from).toEqual({ parentValue: undefined, index: 1 })
    expect(result?.detail.to.index).toBe(0)
  })

  it('should insert after a sibling', () => {
    const result = moveTreeNode(data, {}, 'src', {
      targetValue: 'docs',
      position: 'after',
    })

    expect(keys(result?.data ?? [])).toEqual(['docs', 'src'])
    expect(result?.detail.from).toEqual({ parentValue: undefined, index: 0 })
    expect(result?.detail.to.index).toBe(1)
  })

  it('should move a parent with its whole subtree', () => {
    const result = moveTreeNode(data, {}, 'src', {
      targetValue: 'docs',
      position: 'inside',
    })

    expect(keys(result?.data ?? [])).toEqual(['docs'])
    expect(keysOf(result?.data[0])).toEqual(['src'])
    expect(result?.data[0]?.children?.[0]).toBe(data[0])
  })

  it('should refuse to drop a node on itself', () => {
    expect(
      moveTreeNode(data, {}, 'docs', {
        targetValue: 'docs',
        position: 'after',
      }),
    ).toBeUndefined()
  })

  it('should refuse to drop a parent into its own subtree', () => {
    expect(
      moveTreeNode(data, {}, 'src', {
        targetValue: 'composables',
        position: 'inside',
      }),
    ).toBeUndefined()
  })

  it('should refuse a move that lands where it started', () => {
    expect(
      moveTreeNode(data, {}, 'components', {
        targetValue: 'composables',
        position: 'before',
      }),
    ).toBeUndefined()

    expect(
      moveTreeNode(data, {}, 'composables', {
        targetValue: 'src',
        position: 'inside',
      }),
    ).toBeUndefined()
  })

  it('should respect the children field', () => {
    const nested: TreeOptions = [{ value: 'a', items: [{ value: 'b' }] }, { value: 'c' }]

    const result = moveTreeNode(nested, { children: 'items' }, 'c', {
      targetValue: 'b',
      position: 'inside',
    })

    expect(result?.data).toEqual([{ value: 'a', items: [{ value: 'b', items: [{ value: 'c' }] }] }])
  })

  it('should keep untouched subtrees identical by reference', () => {
    const result = moveTreeNode(data, {}, 'docs', {
      targetValue: 'composables',
      position: 'after',
    })

    expect(result?.data[0]?.children?.[0]).toBe(data[0]?.children?.[0])
  })
})
