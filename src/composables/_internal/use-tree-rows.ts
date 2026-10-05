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

export interface TreeMatched {
  /** Every hit plus its ancestor chain: ancestor-closed, so the row walk can prune subtrees. */
  visible: ReadonlySet<ComponentValue>
  /** The hits alone, without the ancestors kept only for context. */
  exact: ReadonlySet<ComponentValue>
}

/**
 * Splits the current query into the two sets the row walk needs: the ancestor-closed one that
 * prunes whole subtrees, and the hits on their own.
 */
export function useTreeMatched(
  index: MaybeRefOrGetter<TreeIndex>,
  query: MaybeRefOrGetter<string>,
  filter: MaybeRefOrGetter<TreeFilterFn | undefined>,
): ComputedRef<TreeMatched> {
  return computed(() => {
    const visible = new Set<ComponentValue>()
    const exact = new Set<ComponentValue>()
    const needle = (toValue(query) ?? '').trim()

    if (!needle) {
      return { visible, exact }
    }

    const match = toValue(filter) ?? defaultFilter
    const { list, byValue } = toValue(index)

    for (const meta of list) {
      if (!match(meta.node, needle)) {
        continue
      }

      exact.add(meta.node.value)
      visible.add(meta.node.value)

      let parentValue = meta.parentValue
      while (parentValue !== undefined && !visible.has(parentValue)) {
        visible.add(parentValue)
        parentValue = byValue.get(parentValue)?.parentValue
      }
    }

    return { visible, exact }
  })
}

export interface UseTreeRowsOptions {
  query: MaybeRefOrGetter<string>
  expanded: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
  matched: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
  /** The hits without their ancestors; only read when `matchesOnly` is on. */
  exactMatched?: MaybeRefOrGetter<ReadonlySet<ComponentValue> | undefined>
  /** Drop the ancestors that only stayed visible for context, and flatten what is left. */
  matchesOnly?: MaybeRefOrGetter<boolean | undefined>
}

/**
 * Visible rows in document order. Collapsed subtrees and, while searching,
 * everything outside the matched ancestor chains are pruned.
 *
 * Selection state is deliberately absent: it changes on every click, and putting it here would
 * rebuild all N rows for a change that touches two of them. Read the sets at render time instead.
 */
export function useTreeRows(
  index: MaybeRefOrGetter<TreeIndex>,
  options: UseTreeRowsOptions,
): ComputedRef<TreeFlatNode[]> {
  return computed(() => {
    const { list } = toValue(index)
    const expanded = toValue(options.expanded)
    const matched = toValue(options.matched)
    const searching = (toValue(options.query) ?? '').trim().length > 0
    const matchesOnly = searching && toValue(options.matchesOnly) === true
    const exact = toValue(options.exactMatched) ?? matched
    const rows: TreeFlatNode[] = []

    let cursor = 0
    while (cursor < list.length) {
      const meta = list[cursor]

      if (searching && !matched.has(meta.node.value)) {
        cursor = meta.end
        continue
      }

      const value = meta.node.value

      // An ancestor kept alive only for context is skipped, but its subtree still walks: a hit
      // can sit below a parent that did not match on its own.
      if (matchesOnly && !exact.has(value)) {
        cursor++
        continue
      }

      rows.push({
        key: value,
        node: meta.node,
        depth: matchesOnly ? 0 : meta.depth,
        index: rows.length,
        parentValue: matchesOnly ? undefined : meta.parentValue,
        hasChildren: meta.children.length > 0,
        expanded: expanded.has(value),
        matched: matched.has(value),
      })

      cursor++

      if (meta.children.length > 0 && !searching && !expanded.has(value)) {
        cursor = meta.end
      }
    }

    // A search shows a collapsed node's matches below it, so `expanded` cannot keep claiming
    // otherwise. In document order the next row is the first child exactly when it sits deeper.
    // `matchesOnly` flattens every row to depth 0, where this settles back to false.
    if (searching) {
      for (let i = 0; i < rows.length - 1; i++) {
        if (rows[i].hasChildren) {
          rows[i].expanded = rows[i + 1].depth > rows[i].depth
        }
      }
    }

    return rows
  })
}
