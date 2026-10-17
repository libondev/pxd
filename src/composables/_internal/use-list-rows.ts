import type { ListOption, ListOptionEntry, ListOptionGroup } from '../../components/list/types'
import { isListOptionGroup } from './use-selected-list-item.js'

export interface ListHeaderRow {
  type: 'header'
  key: string
  label?: string
  group: ListOptionGroup
  groupIndex: number
}

export interface ListItemRow {
  type: 'item'
  key: string
  option: ListOption
  navIndex: number
  /** Index of this row in the flattened render/virtualizer row list. */
  rowIndex: number
  group?: ListOptionGroup
  groupIndex?: number
  itemIndex: number
}

export type ListRow = ListHeaderRow | ListItemRow

export interface FlattenListOptionsResult {
  rows: ListRow[]
  /** Item rows indexed by their dense `navIndex`. */
  itemRows: ListItemRow[]
  navigableCount: number
}

/**
 * Flatten grouped options into a linear row list for rendering / virtualization.
 * Headers are not navigable; each item gets a dense `navIndex`.
 */
export function flattenListOptions(options: ListOptionEntry[]): FlattenListOptionsResult {
  const rows: ListRow[] = []
  const itemRows: ListItemRow[] = []
  let navIndex = 0

  for (let groupIndex = 0; groupIndex < options.length; groupIndex++) {
    const entry = options[groupIndex]

    if (isListOptionGroup(entry)) {
      rows.push({
        type: 'header',
        key: `group-${entry.label ?? groupIndex}`,
        label: entry.label,
        group: entry,
        groupIndex,
      })

      for (let itemIndex = 0; itemIndex < entry.options.length; itemIndex++) {
        const option = entry.options[itemIndex]
        const row: ListItemRow = {
          type: 'item',
          key: String(option.value),
          option,
          navIndex: navIndex++,
          rowIndex: rows.length,
          group: entry,
          groupIndex,
          itemIndex,
        }

        rows.push(row)
        itemRows.push(row)
      }
    } else {
      const row: ListItemRow = {
        type: 'item',
        key: String(entry.value),
        option: entry,
        navIndex: navIndex++,
        rowIndex: rows.length,
        itemIndex: groupIndex,
      }

      rows.push(row)
      itemRows.push(row)
    }
  }

  return {
    rows,
    itemRows,
    navigableCount: navIndex,
  }
}

export function resolveNavigableOption(rows: ListRow[], navIndex: number): ListItemRow | undefined {
  for (const row of rows) {
    if (row.type === 'item' && row.navIndex === navIndex) {
      return row
    }
  }

  return undefined
}

export function resolveRowIndexByNavIndex(rows: ListRow[], navIndex: number): number {
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    if (row.type === 'item' && row.navIndex === navIndex) {
      return i
    }
  }

  return -1
}
