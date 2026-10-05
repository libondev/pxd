import type { TreeOption, TreeOptions } from '../../src/components/tree/types'
import { describe, expect, it } from 'vite-plus/test'
import { moveTreeNode } from '../../src/composables/_internal/use-tree-move.js'

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

function keys(list: TreeOption[]): unknown[] {
  return list.map((node) => node.value)
}

function keysOf(node: TreeOption | undefined): unknown[] {
  return Array.isArray(node?.children) ? keys(node.children) : []
}

describe('moveTreeNode', () => {
  it('should move a node between the root and a subtree', () => {
    const result = moveTreeNode(data, 'children', 'docs', {
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
    const result = moveTreeNode(data, 'children', 'docs', {
      targetValue: 'src',
      position: 'before',
    })

    expect(keys(result?.data ?? [])).toEqual(['docs', 'src'])
    expect(result?.detail.from).toEqual({ parentValue: undefined, index: 1 })
    expect(result?.detail.to.index).toBe(0)
  })

  it('should insert after a sibling', () => {
    const result = moveTreeNode(data, 'children', 'src', {
      targetValue: 'docs',
      position: 'after',
    })

    expect(keys(result?.data ?? [])).toEqual(['docs', 'src'])
    expect(result?.detail.from).toEqual({ parentValue: undefined, index: 0 })
    expect(result?.detail.to.index).toBe(1)
  })

  it('should move a parent with its whole subtree', () => {
    const result = moveTreeNode(data, 'children', 'src', {
      targetValue: 'docs',
      position: 'inside',
    })

    expect(keys(result?.data ?? [])).toEqual(['docs'])
    expect(keysOf(result?.data[0])).toEqual(['src'])
    expect(result?.data[0]?.children?.[0]).toBe(data[0])
  })

  it('should refuse to drop a node on itself', () => {
    expect(
      moveTreeNode(data, 'children', 'docs', {
        targetValue: 'docs',
        position: 'after',
      }),
    ).toBeUndefined()
  })

  it('should refuse to drop a parent into its own subtree', () => {
    expect(
      moveTreeNode(data, 'children', 'src', {
        targetValue: 'composables',
        position: 'inside',
      }),
    ).toBeUndefined()
  })

  it('should refuse a move that lands where it started', () => {
    expect(
      moveTreeNode(data, 'children', 'components', {
        targetValue: 'composables',
        position: 'before',
      }),
    ).toBeUndefined()

    expect(
      moveTreeNode(data, 'children', 'composables', {
        targetValue: 'src',
        position: 'inside',
      }),
    ).toBeUndefined()
  })

  it('should respect the children field', () => {
    const nested: TreeOptions = [{ value: 'a', items: [{ value: 'b' }] }, { value: 'c' }]

    const result = moveTreeNode(nested, 'items', 'c', {
      targetValue: 'b',
      position: 'inside',
    })

    expect(result?.data).toEqual([
      { value: 'a', items: [{ value: 'b', items: [{ value: 'c' }] }] },
    ])
  })

  it('should keep untouched subtrees identical by reference', () => {
    const result = moveTreeNode(data, 'children', 'docs', {
      targetValue: 'composables',
      position: 'after',
    })

    expect(result?.data[0]?.children?.[0]).toBe(data[0]?.children?.[0])
  })
})