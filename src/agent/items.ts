import type { AgentItem } from './types'

interface OptionLike {
  label?: unknown
  value?: unknown
  disabled?: boolean
}

interface TreeOptionLike extends OptionLike {
  children?: readonly TreeOptionLike[]
}

const text = (label: unknown) =>
  typeof label === 'string' || typeof label === 'number' ? label : undefined

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

// The choices a component's own options prop describes, in the order it renders them.
export function optionItems(
  options: readonly OptionLike[] | undefined,
  selected?: unknown,
): AgentItem[] {
  return (options ?? []).map((option) => toItem(option, selected))
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
