import type { AgentItem } from './types'

interface OptionLike {
  type?: string
  label?: unknown
  value?: unknown
  disabled?: boolean
  options?: readonly OptionLike[]
}

interface TreeOptionLike extends OptionLike {
  children?: readonly TreeOptionLike[]
}

const text = (label: unknown) =>
  typeof label === 'string' || typeof label === 'number' ? label : undefined

/** One value as a key, so an object is compared by its contents rather than by "[object Object]". */
export const itemKey = (value: unknown) =>
  value !== null && typeof value === 'object' ? JSON.stringify(value) : String(value)

// A model value is one value or a list of them, and the same test reads both.
const isChosen = (selected: unknown, value: unknown) =>
  Array.isArray(selected) ? selected.includes(value) : selected === value

function toItem(option: OptionLike, selected: unknown): AgentItem {
  const item: AgentItem = { value: option.value }
  const label = text(option.label)

  if (label !== undefined) {
    item.label = label
  }

  if (selected !== undefined && isChosen(selected, option.value)) {
    item.selected = true
  }

  if (option.disabled) {
    item.disabled = true
  }

  return item
}

// The choices a component's own options prop describes, in the order it renders them. A
// group is a heading, not a choice, so its options are flattened into their place.
export function optionItems(
  options: readonly OptionLike[] | undefined,
  selected?: unknown,
): AgentItem[] {
  const items: AgentItem[] = []

  const add = (entries: readonly OptionLike[]) => {
    for (const entry of entries) {
      if (entry.type === 'group' && entry.options) {
        add(entry.options)
      } else {
        items.push(toItem(entry, selected))
      }
    }
  }

  add(options ?? [])

  return items
}

// The same, flattened in reading order, for a tree whose rows are nested branches.
export function treeItems(
  data: readonly TreeOptionLike[] | undefined,
  options: { selected?: unknown; expanded?: readonly unknown[] } = {},
): AgentItem[] {
  const items: AgentItem[] = []

  const walk = (nodes: readonly TreeOptionLike[]) => {
    for (const node of nodes) {
      const item = toItem(node, options.selected)

      if (options.expanded?.includes(node.value)) {
        item.expanded = true
      }

      items.push(item)

      if (node.children?.length) {
        walk(node.children)
      }
    }
  }

  walk(data ?? [])

  return items
}
