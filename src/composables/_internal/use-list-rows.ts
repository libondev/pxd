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
  group?: ListOptionGroup
  groupIndex?: number
  itemIndex: number
}

export type ListRow = ListHeaderRow | ListItemRow

export interface FlattenListOptionsResult {
  rows: ListRow[]
  navigableCount: number
}

/**
 * Flatten grouped options into a linear row list for rendering / virtualization.
 * Headers are not navigable; each item gets a dense `navIndex`.
 */
export function flattenListOptions(options: ListOptionEntry[]): FlattenListOptionsResult {
  const rows: ListRow[] = []
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
        rows.push({
          type: 'item',
          key: String(option.value),
          option,
          navIndex: navIndex++,
          group: entry,
          groupIndex,
          itemIndex,
        })
      }
    } else {
      rows.push({
        type: 'item',
        key: String(entry.value),
        option: entry,
        navIndex: navIndex++,
        itemIndex: groupIndex,
      })
    }
  }

  return {
    rows,
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
