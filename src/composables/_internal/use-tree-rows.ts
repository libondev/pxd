import type { TreeFilterFn, TreeFlatNode, TreeOptions } from '../../components/tree/types'
import type { ComponentValue } from '../../types/shared'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed } from 'vue'
import { isFuzzyMatch } from '../../utils/fuzzy-match.js'
import { toValue } from '../../utils/helper.js'

export interface TreeNodeMeta {
  node: TreeOptions[number]
  children: TreeNodeMeta[]
  parentValue?: ComponentValue
  depth: number
  /** Exclusive index in `list` right after this subtree. */
  end: number
}

export interface TreeIndex {
  list: TreeNodeMeta[]
  byValue: Map<ComponentValue, TreeNodeMeta>
}

/** Depth-first pre-order walk: `list` is document order, `end` marks subtree bounds. */
export function createTreeIndex(data: TreeOptions, childrenField: string): TreeIndex {
  const list: TreeNodeMeta[] = []
  const byValue = new Map<ComponentValue, TreeNodeMeta>()

  function visit(
    node: TreeOptions[number],
    parentValue: ComponentValue | undefined,
    depth: number,
  ): TreeNodeMeta {
    const meta: TreeNodeMeta = { node, children: [], parentValue, depth, end: 0 }

    list.push(meta)
    byValue.set(node.value, meta)

    const children = node[childrenField]
    if (Array.isArray(children)) {
      for (const child of children) {
        meta.children.push(visit(child, node.value, depth + 1))
      }
    }

    meta.end = list.length
    return meta
  }

  for (const node of data) {
    visit(node, undefined, 0)
  }

  return { list, byValue }
}

export function useTreeIndex(
  data: MaybeRefOrGetter<TreeOptions>,
  childrenField: MaybeRefOrGetter<string>,
): ComputedRef<TreeIndex> {
  return computed(() => createTreeIndex(toValue(data) ?? [], toValue(childrenField) ?? 'children'))
}

function defaultFilter(node: TreeOptions[number], query: string): boolean {
  return isFuzzyMatch(String(node.label ?? ''), query, node.keywords)
}

/**
 * Values that must stay visible for the current query: every hit plus its ancestor
 * chain. Ancestor-closed by construction, so the row walk can prune whole subtrees.
 */
export function useTreeMatched(
  index: MaybeRefOrGetter<TreeIndex>,
  query: MaybeRefOrGetter<string>,
  filter: MaybeRefOrGetter<TreeFilterFn | undefined>,
): ComputedRef<Set<ComponentValue>> {
  return computed(() => {
    const result = new Set<ComponentValue>()
    const needle = (toValue(query) ?? '').trim()

    if (!needle) {
      return result
    }

    const match = toValue(filter) ?? defaultFilter
    const { list, byValue } = toValue(index)

    for (const meta of list) {
      if (!match(meta.node, needle)) {
        continue
      }

      result.add(meta.node.value)

      let parentValue = meta.parentValue
      while (parentValue !== undefined && !result.has(parentValue)) {
        result.add(parentValue)
        parentValue = byValue.get(parentValue)?.parentValue
      }
    }

    return result
  })
}

export interface UseTreeRowsOptions {
  query: MaybeRefOrGetter<string>
  expanded: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
  matched: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
  checked: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
  indeterminate: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
}

/**
 * Visible rows in document order. Collapsed subtrees and, while searching,
 * everything outside the matched ancestor chains are pruned.
 */
export function useTreeRows(
  index: MaybeRefOrGetter<TreeIndex>,
  options: UseTreeRowsOptions,
): ComputedRef<TreeFlatNode[]> {
  return computed(() => {
    const { list } = toValue(index)
    const expanded = toValue(options.expanded)
    const matched = toValue(options.matched)
    const checked = toValue(options.checked)
    const indeterminate = toValue(options.indeterminate)
    const searching = (toValue(options.query) ?? '').trim().length > 0
    const rows: TreeFlatNode[] = []

    let cursor = 0
    while (cursor < list.length) {
      const meta = list[cursor]

      if (searching && !matched.has(meta.node.value)) {
        cursor = meta.end
        continue
      }

      const value = meta.node.value

      rows.push({
        key: value,
        node: meta.node,
        depth: meta.depth,
        index: rows.length,
        parentValue: meta.parentValue,
        hasChildren: meta.children.length > 0,
        expanded: expanded.has(value),
        checked: checked.has(value),
        indeterminate: indeterminate.has(value),
        matched: matched.has(value),
      })

      cursor++

      if (meta.children.length > 0 && !searching && !expanded.has(value)) {
        cursor = meta.end
      }
    }

    return rows
  })
}
