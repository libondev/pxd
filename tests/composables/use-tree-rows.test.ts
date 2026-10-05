import { describe, expect, it } from 'vite-plus/test'
import { createTreeIndex } from '../../src/composables/_internal/use-tree-rows'

const data = [
  {
    value: 'a',
    children: [{ value: 'a-1' }, { value: 'a-2' }],
  },
  { value: 'b' },
]

describe('createTreeIndex', () => {
  it('should walk the tree in document order with depths', () => {
    const { list } = createTreeIndex(data, 'children')

    expect(list.map((meta) => meta.node.value)).toEqual(['a', 'a-1', 'a-2', 'b'])
    expect(list.map((meta) => meta.depth)).toEqual([0, 1, 1, 0])
    expect(list.map((meta) => meta.parentValue)).toEqual([undefined, 'a', 'a', undefined])
  })

  it('should mark the exclusive end of every subtree', () => {
    const { list } = createTreeIndex(data, 'children')

    expect(list.map((meta) => meta.end)).toEqual([3, 2, 3, 4])
  })

  it('should read children from a custom field', () => {
    const { list } = createTreeIndex([{ value: 'root', nodes: [{ value: 'child' }] }], 'nodes')

    expect(list.map((meta) => meta.node.value)).toEqual(['root', 'child'])
  })

  it('should keep an entry without children addressable', () => {
    const { byValue } = createTreeIndex(data, 'children')

    expect(byValue.get('a-2')?.children.length).toBe(0)
  })
})
