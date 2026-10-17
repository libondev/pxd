import { describe, expect, it } from 'vite-plus/test'
import { flattenListOptions } from '../../src/composables/_internal/use-list-rows'

describe('flattenListOptions', () => {
  it('should index items by navIndex and keep their row index', () => {
    const result = flattenListOptions([
      {
        type: 'group',
        label: 'Group',
        options: [
          { label: 'Item 1', value: '1' },
          { label: 'Item 2', value: '2' },
        ],
      },
    ])

    expect(result.rows).toHaveLength(3)
    expect(result.navigableCount).toBe(2)
    expect(result.itemRows[0]?.navIndex).toBe(0)
    expect(result.itemRows[0]?.rowIndex).toBe(1)
    expect(result.itemRows[1]?.navIndex).toBe(1)
    expect(result.itemRows[1]?.rowIndex).toBe(2)
  })
})
