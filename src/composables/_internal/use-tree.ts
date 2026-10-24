import type {
  TreeDropPosition,
  TreeDropTarget,
  TreeFieldNames,
  TreeFilterFn,
  TreeMoveDetail,
  TreeModelValue,
  TreeOption,
  TreeOptions,
  TreeRemoteFilterFn,
  TreeSelectableFn,
} from '../../components/tree/types'
import type { ComponentValue } from '../../types/shared/props'
import type { MaybeElementRef } from '../../types/shared/utils'
import type { ComputedRef, MaybeRefOrGetter, ShallowRef } from 'vue'
import { computed, onScopeDispose, shallowRef, watch } from 'vue'
import { getElement } from '../../utils/dom.js'
import { isCompositionKeydown } from '../../utils/event.js'
import { isFuzzyMatch } from '../../utils/fuzzy-match.js'
import { toValue } from '../../utils/helper.js'
import { debounce } from '../../utils/timing.js'

export interface TreeFlatNode {
  key: ComponentValue
  node: TreeOption
  depth: number
  index: number
  parentValue?: ComponentValue
  hasChildren: boolean
  expanded: boolean
}

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

export interface ResolvedTreeFieldNames {
  value: string
  label: string
  children: string
  disabled: string
  isLeaf: string
}

export function resolveTreeFieldNames(
  fieldNames: TreeFieldNames | undefined,
): ResolvedTreeFieldNames {
  return {
    value: fieldNames?.value ?? 'value',
    label: fieldNames?.label ?? 'label',
    children: fieldNames?.children ?? 'children',
    disabled: fieldNames?.disabled ?? 'disabled',
    isLeaf: fieldNames?.isLeaf ?? 'isLeaf',
  }
}

export function createTreeIndex(data: TreeOptions, fieldNames?: TreeFieldNames): TreeIndex {
  const fields = resolveTreeFieldNames(fieldNames)
  const list: TreeNodeMeta[] = []
  const byValue = new Map<ComponentValue, TreeNodeMeta>()

  function visit(
    node: TreeOptions[number],
    parentValue: ComponentValue | undefined,
    depth: number,
  ): TreeNodeMeta {
    const meta: TreeNodeMeta = { node, children: [], parentValue, depth, end: 0 }
    const value = node[fields.value]

    list.push(meta)
    byValue.set(value, meta)

    const children = node[fields.children]
    if (Array.isArray(children)) {
      for (const child of children) {
        meta.children.push(visit(child, value, depth + 1))
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
  fieldNames: MaybeRefOrGetter<TreeFieldNames | undefined>,
): ComputedRef<TreeIndex> {
  return computed(() => createTreeIndex(toValue(data) ?? [], toValue(fieldNames)))
}

function graftNode(
  node: TreeOption,
  loaded: Map<ComponentValue, TreeOptions>,
  fields: ResolvedTreeFieldNames,
): TreeOption {
  const own = node[fields.children]
  const fromData = Array.isArray(own) && own.length > 0
  const value = node[fields.value]
  const source: TreeOptions = fromData ? own : (loaded.get(value) ?? [])
  const children: TreeOptions = []
  let changed = !fromData && loaded.has(value)

  for (const child of source) {
    const grafted = graftNode(child, loaded, fields)

    if (grafted !== child) {
      changed = true
    }

    children.push(grafted)
  }

  return changed ? { ...node, [fields.children]: children } : node
}

/** Children in `data` win over a cached request, and an untouched node keeps its identity. */
export function graftLoadedChildren(
  data: TreeOptions,
  loaded: Map<ComponentValue, TreeOptions>,
  fieldNames?: TreeFieldNames,
): TreeOptions {
  if (loaded.size === 0) {
    return data
  }

  const fields = resolveTreeFieldNames(fieldNames)
  let changed = false
  const next = data.map((node) => {
    const grafted = graftNode(node, loaded, fields)

    if (grafted !== node) {
      changed = true
    }

    return grafted
  })

  return changed ? next : data
}

/** Only a non-empty array marks a parent: `children: []` is a leaf unless `isLeaf` says otherwise. */
export function hasTreeChildren(node: TreeOption, fieldNames?: TreeFieldNames): boolean {
  const children = node[resolveTreeFieldNames(fieldNames).children]

  return Array.isArray(children) && children.length > 0
}

/**
 * `isLeaf` first, then the data, then a lazy node still waiting. `loadable` means a request would
 * start now, so a node whose request resolved with nothing becomes a leaf.
 */
export function isTreeLeaf(
  node: TreeOption,
  fieldNames: TreeFieldNames | undefined,
  loadable: boolean,
): boolean {
  const fields = resolveTreeFieldNames(fieldNames)
  const isLeaf = node[fields.isLeaf]

  if (isLeaf !== undefined) {
    return isLeaf
  }

  return !hasTreeChildren(node, fields) && !loadable
}

function defaultFilter(
  node: TreeOptions[number],
  query: string,
  fields: ResolvedTreeFieldNames,
): boolean {
  return isFuzzyMatch(String(node[fields.label] ?? ''), query, node.keywords)
}

export interface TreeMatched {
  /** Every hit plus its ancestors: ancestor-closed, so the row walk can prune whole subtrees. */
  visible: ReadonlySet<ComponentValue>
  /** The hits alone. */
  exact: ReadonlySet<ComponentValue>
}

export function useTreeMatched(
  index: MaybeRefOrGetter<TreeIndex>,
  query: MaybeRefOrGetter<string>,
  filter: MaybeRefOrGetter<TreeFilterFn | undefined>,
  fieldNames?: MaybeRefOrGetter<TreeFieldNames | undefined>,
): ComputedRef<TreeMatched> {
  return computed(() => {
    const visible = new Set<ComponentValue>()
    const exact = new Set<ComponentValue>()
    const needle = (toValue(query) ?? '').trim()

    if (!needle) {
      return { visible, exact }
    }

    const fields = resolveTreeFieldNames(toValue(fieldNames))
    const match = toValue(filter) ?? ((node: TreeOption) => defaultFilter(node, needle, fields))
    const { list, byValue } = toValue(index)

    for (const meta of list) {
      if (!match(meta.node, needle)) {
        continue
      }

      exact.add(meta.node[fields.value])
      visible.add(meta.node[fields.value])

      let parentValue = meta.parentValue
      while (parentValue !== undefined && !visible.has(parentValue)) {
        visible.add(parentValue)
        parentValue = byValue.get(parentValue)?.parentValue
      }
    }

    return { visible, exact }
  })
}

const REMOTE_SEARCH_DEBOUNCE = 200

export interface UseTreeSearchOptions {
  query: MaybeRefOrGetter<string>
  remoteFilter?: MaybeRefOrGetter<TreeRemoteFilterFn | undefined>
}

export interface UseTreeSearchReturn {
  /** The forest the query last settled on, absent before the first answer. */
  matches: ShallowRef<TreeOptions | undefined>
  remote: ComputedRef<boolean>
  /** Whether a request is in flight, the debounce window included. */
  pending: ShallowRef<boolean>
  active: ComputedRef<boolean>
}

export function useTreeSearch(options: UseTreeSearchOptions): UseTreeSearchReturn {
  const matches = shallowRef<TreeOptions>()
  const pending = shallowRef(false)
  const remote = computed(() => typeof toValue(options.remoteFilter) === 'function')
  const needle = computed(() => (toValue(options.query) ?? '').trim())
  const active = computed(() => remote.value && needle.value !== '' && matches.value !== undefined)

  let requestId = 0

  /** A query that moves on retires the request it interrupts, so its answer can never land. */
  function invalidate(): void {
    requestId += 1
    runSearch.cancel()
  }

  async function run(query: string): Promise<void> {
    const at = ++requestId
    const remoteFilter = toValue(options.remoteFilter)

    if (!remoteFilter) {
      return
    }

    try {
      const result = await remoteFilter(query)

      if (at === requestId) {
        matches.value = Array.isArray(result) ? result : []
      }
    } catch {
      if (at === requestId) {
        matches.value = []
      }
    } finally {
      if (at === requestId) {
        pending.value = false
      }
    }
  }

  const runSearch = debounce((query: string) => {
    void run(query)
  }, REMOTE_SEARCH_DEBOUNCE)

  watch(
    [remote, needle],
    ([isRemote, query]) => {
      invalidate()

      // A forest from an earlier query must not outlive it.
      if (!isRemote || !query) {
        matches.value = undefined
        pending.value = false
        return
      }

      // Pending from the keystroke rather than from the request: the debounce window is part of it.
      pending.value = true
      runSearch(query)
    },
    { immediate: true },
  )

  onScopeDispose(invalidate)

  return { matches, remote, pending, active }
}

export interface UseTreeRowsOptions {
  query: MaybeRefOrGetter<string>
  expanded: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
  matched: MaybeRefOrGetter<ReadonlySet<ComponentValue>>
  /** The hits without their ancestors; only read when `matchesOnly` is on. */
  exactMatched?: MaybeRefOrGetter<ReadonlySet<ComponentValue> | undefined>
  matchesOnly?: MaybeRefOrGetter<boolean | undefined>
  canLoad?: MaybeRefOrGetter<((value: ComponentValue) => boolean) | undefined>
  fieldNames?: MaybeRefOrGetter<TreeFieldNames | undefined>
}

/**
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
    const canLoad = toValue(options.canLoad)
    const fields = resolveTreeFieldNames(toValue(options.fieldNames))
    const rows: TreeFlatNode[] = []

    let cursor = 0
    while (cursor < list.length) {
      const meta = list[cursor]

      if (searching && !matched.has(meta.node[fields.value])) {
        cursor = meta.end
        continue
      }

      const value = meta.node[fields.value]

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
        hasChildren: !isTreeLeaf(meta.node, fields, canLoad?.(value) === true),
        expanded: expanded.has(value),
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

export interface UseTreeSelectionOptions {
  index: MaybeRefOrGetter<TreeIndex>
  modelValue: MaybeRefOrGetter<TreeModelValue | undefined>
  multiple: MaybeRefOrGetter<boolean>
  checkStrictly?: MaybeRefOrGetter<boolean | undefined>
  selectable?: MaybeRefOrGetter<TreeSelectableFn | undefined>
  fieldNames?: MaybeRefOrGetter<TreeFieldNames | undefined>
}

export interface TreeToggleResult {
  value: TreeModelValue
  halfCheckedValues: ComponentValue[]
}

export interface UseTreeSelectionReturn {
  checked: ComputedRef<Set<ComponentValue>>
  indeterminate: ComputedRef<Set<ComponentValue>>
  toggle: (value: ComponentValue) => TreeToggleResult
  /** The span between the anchor and `value`, both ends included; toggles without an anchor. */
  extend: (value: ComponentValue) => TreeToggleResult
  isSelectable: (value: ComponentValue) => boolean
}

interface DerivedState {
  checked: Set<ComponentValue>
  indeterminate: Set<ComponentValue>
}

function collect(modelValue: TreeModelValue | undefined): Set<ComponentValue> {
  if (Array.isArray(modelValue)) {
    return new Set(modelValue)
  }

  return modelValue == null ? new Set() : new Set([modelValue])
}

/** One post-order pass, so a cascade stays O(n): a parent lights up once every child is checked. */
function derive(
  list: TreeNodeMeta[],
  selected: ReadonlySet<ComponentValue>,
  selectable: (meta: TreeNodeMeta) => boolean,
  fields: ResolvedTreeFieldNames,
): DerivedState {
  const checked = new Set<ComponentValue>()
  const indeterminate = new Set<ComponentValue>()
  const stats = new Map<TreeNodeMeta, { total: number; hit: number }>()

  for (let i = list.length - 1; i >= 0; i--) {
    const meta = list[i]
    const value = meta.node[fields.value]
    let total = 0
    let hit = 0

    for (const child of meta.children) {
      const childStat = stats.get(child)
      total += childStat?.total ?? 0
      hit += childStat?.hit ?? 0
    }

    const takes = selectable(meta)
    const isChecked = total > 0 ? hit === total : selected.has(value)

    // A refused node is refused the clicks only: what the model carries stays selected, and a
    // partial subtree still lights its parent.
    if (isChecked && (takes || selected.has(value))) {
      checked.add(value)
    } else if (hit > 0) {
      indeterminate.add(value)
    }

    stats.set(meta, {
      total: total + (takes ? 1 : 0),
      hit: hit + (isChecked && takes ? 1 : 0),
    })
  }

  return { checked, indeterminate }
}

export function useTreeSelection(options: UseTreeSelectionOptions): UseTreeSelectionReturn {
  const selected = computed(() => collect(toValue(options.modelValue)))
  /** Where the selection last landed, and how far the last extension reached. */
  let anchor: ComponentValue | undefined
  let current: ComponentValue | undefined

  function fields(): ResolvedTreeFieldNames {
    return resolveTreeFieldNames(toValue(options.fieldNames))
  }

  function selectable(meta: TreeNodeMeta): boolean {
    return (
      meta.node[fields().disabled] !== true && toValue(options.selectable)?.(meta.node) !== false
    )
  }

  function isSelectable(value: ComponentValue): boolean {
    const meta = toValue(options.index).byValue.get(value)

    return meta !== undefined && selectable(meta)
  }

  /** Without the cascade there is no partial parent either: the model *is* the checked set. */
  const state = computed<DerivedState>(() => {
    if (!toValue(options.multiple) || toValue(options.checkStrictly)) {
      return { checked: selected.value, indeterminate: new Set<ComponentValue>() }
    }

    return derive(toValue(options.index).list, selected.value, selectable, fields())
  })

  /** Document order, so the emitted array never depends on the order the user clicked. */
  function toToggleResult(list: TreeNodeMeta[], result: DerivedState): TreeToggleResult {
    const names = fields()

    return {
      value: list
        .filter((item) => result.checked.has(item.node[names.value]))
        .map((item) => item.node[names.value]),
      halfCheckedValues: list
        .filter((item) => result.indeterminate.has(item.node[names.value]))
        .map((item) => item.node[names.value]),
    }
  }

  function toggle(value: ComponentValue): TreeToggleResult {
    if (!toValue(options.multiple)) {
      return { value: selected.value.has(value) ? null : value, halfCheckedValues: [] }
    }

    const { list, byValue } = toValue(options.index)
    const meta = byValue.get(value)

    if (!meta || !selectable(meta)) {
      return toToggleResult(list, state.value)
    }

    const next = new Set(selected.value)
    const willCheck = !state.value.checked.has(value)

    // A clearing click leaves the anchor, so a shift-click after it still extends from there.
    if (willCheck) {
      anchor = value
      current = value
    }

    if (toValue(options.checkStrictly)) {
      if (willCheck) {
        next.add(value)
      } else {
        next.delete(value)
      }

      return toToggleResult(list, { checked: next, indeterminate: new Set() })
    }

    const names = fields()

    for (let i = list.indexOf(meta); i < meta.end; i++) {
      const item = list[i]

      if (!selectable(item)) {
        continue
      }

      if (willCheck) {
        next.add(item.node[names.value])
      } else {
        next.delete(item.node[names.value])
      }
    }

    return toToggleResult(list, derive(list, next, selectable, names))
  }

  function span(from: TreeNodeMeta, to: TreeNodeMeta): TreeNodeMeta[] {
    const { list } = toValue(options.index)
    const start = list.indexOf(from)
    const end = list.indexOf(to)

    return list.slice(Math.min(start, end), Math.max(start, end) + 1)
  }

  function extend(value: ComponentValue): TreeToggleResult {
    const { list, byValue } = toValue(options.index)
    const to = byValue.get(value)
    const from = anchor === undefined ? undefined : byValue.get(anchor)
    const reached = current === undefined ? undefined : byValue.get(current)

    if (!to || !from || !toValue(options.multiple)) {
      return toggle(value)
    }

    const next = new Set(selected.value)

    const names = fields()

    // Undo the last span before taking the new one, the way React Aria's `extendSelection` does:
    // that is what lets a shift-click back inside the span shrink it instead of leaving it wider.
    for (const item of span(from, reached ?? to)) {
      next.delete(item.node[names.value])
    }

    for (const item of span(from, to)) {
      if (selectable(item)) {
        next.add(item.node[names.value])
      }
    }

    current = value

    return toValue(options.checkStrictly)
      ? toToggleResult(list, { checked: next, indeterminate: new Set() })
      : toToggleResult(list, derive(list, next, selectable, names))
  }

  return {
    checked: computed(() => state.value.checked),
    indeterminate: computed(() => state.value.indeterminate),
    toggle,
    extend,
    isSelectable,
  }
}

/** Walks up instead of scanning `index.list`: the hit test runs this on every pointer move. */
export function isTreeDescendant(
  index: TreeIndex,
  ancestorValue: ComponentValue,
  value: ComponentValue,
): boolean {
  const ancestor = index.byValue.get(ancestorValue)
  let current = index.byValue.get(value)

  while (current && current.parentValue !== undefined) {
    const parent = index.byValue.get(current.parentValue)

    if (!parent) {
      return false
    }

    if (parent === ancestor) {
      return true
    }

    current = parent
  }

  return false
}

interface Removal {
  list: TreeOptions
  node: TreeOption
  parentValue?: ComponentValue
  index: number
}

/** Rebuilds only the path to the node, so untouched subtrees keep their identity. */
function removeNode(
  list: TreeOptions,
  fields: ResolvedTreeFieldNames,
  value: ComponentValue,
  parentValue?: ComponentValue,
): Removal | undefined {
  const at = list.findIndex((node) => node[fields.value] === value)

  if (at !== -1) {
    return {
      list: [...list.slice(0, at), ...list.slice(at + 1)],
      node: list[at],
      parentValue,
      index: at,
    }
  }

  for (let i = 0; i < list.length; i++) {
    const children = list[i][fields.children]

    if (!Array.isArray(children)) {
      continue
    }

    const result = removeNode(children, fields, value, list[i][fields.value])

    if (!result) {
      continue
    }

    const next = [...list]
    next[i] = { ...list[i], [fields.children]: result.list }

    return { ...result, list: next }
  }

  return undefined
}

interface Insertion {
  list: TreeOptions
  parentValue?: ComponentValue
  index: number
}

function insertNode(
  list: TreeOptions,
  fields: ResolvedTreeFieldNames,
  target: TreeDropTarget,
  node: TreeOption,
  parentValue?: ComponentValue,
): Insertion | undefined {
  const at = list.findIndex((item) => item[fields.value] === target.targetValue)

  if (at !== -1) {
    const next = [...list]

    if (target.position === 'inside') {
      const raw = next[at][fields.children]
      const children = Array.isArray(raw) ? raw : []

      next[at] = { ...next[at], [fields.children]: [...children, node] }

      return { list: next, parentValue: next[at][fields.value], index: children.length }
    }

    const index = target.position === 'after' ? at + 1 : at
    next.splice(index, 0, node)

    return { list: next, parentValue, index }
  }

  for (let i = 0; i < list.length; i++) {
    const children = list[i][fields.children]

    if (!Array.isArray(children)) {
      continue
    }

    const result = insertNode(children, fields, target, node, list[i][fields.value])

    if (!result) {
      continue
    }

    const next = [...list]
    next[i] = { ...list[i], [fields.children]: result.list }

    return { ...result, list: next }
  }

  return undefined
}

export interface TreeMoveResult {
  data: TreeOptions
  detail: TreeMoveDetail
}

/**
 * The node is detached before the target is looked up, which rejects the whole family of invalid
 * drops for free: it and its descendant are no longer in the tree to be found.
 */
export function moveTreeNode(
  data: TreeOptions,
  fieldNames: TreeFieldNames | undefined,
  value: ComponentValue,
  target: TreeDropTarget,
): TreeMoveResult | undefined {
  const fields = resolveTreeFieldNames(fieldNames)
  const removal = removeNode(data, fields, value)

  if (!removal) {
    return undefined
  }

  const insertion = insertNode(removal.list, fields, target, removal.node)

  if (!insertion) {
    return undefined
  }

  if (removal.parentValue === insertion.parentValue && removal.index === insertion.index) {
    return undefined
  }

  return {
    data: insertion.list,
    detail: {
      value,
      node: removal.node,
      from: { parentValue: removal.parentValue, index: removal.index },
      to: {
        parentValue: insertion.parentValue,
        index: insertion.index,
        targetValue: target.targetValue,
        position: target.position,
      },
    },
  }
}

const DRAG_THRESHOLD = 5

/** A finger that moves inside this window is panning the page, so a touch must hold still. */
const HOLD_DELAY = 300

const EXPAND_DELAY = 500

export interface UseTreeDragOptions {
  container: MaybeElementRef<HTMLElement>
  rows: MaybeRefOrGetter<TreeFlatNode[]>
  enabled: MaybeRefOrGetter<boolean>
  dropInsideLeaf: MaybeRefOrGetter<boolean>
  /** Rejects a position the tree will refuse, so no indicator is ever painted for it. */
  canDrop: (
    value: ComponentValue,
    targetValue: ComponentValue,
    position: TreeDropPosition,
  ) => boolean
  onExpand: (value: ComponentValue) => void
  onCommit: (value: ComponentValue, target: TreeDropTarget) => void
}

/** Content coordinates, not viewport ones, so a cached rect survives a scroll. */
interface RowRect {
  row: TreeFlatNode
  top: number
  height: number
}

/** A press not yet a drag: a mouse converts it past the threshold, a touch waits out the hold. */
interface Armed {
  value: ComponentValue
  x: number
  y: number
  pointerId: number
  hold: boolean
  timer?: ReturnType<typeof setTimeout>
}

export function useTreeDrag(options: UseTreeDragOptions) {
  const value = shallowRef<ComponentValue>()
  const target = shallowRef<TreeDropTarget>()
  const x = shallowRef(0)
  const y = shallowRef(0)

  let armed: Armed | undefined
  let expandTimer: ReturnType<typeof setTimeout> | undefined
  let expandValue: ComponentValue | undefined
  let cachedRects: RowRect[] = []
  let contentOrigin = 0
  let captured: { el: HTMLElement; pointerId: number } | undefined
  let justDragged = false

  function measureRows(container: HTMLElement, items: NodeListOf<HTMLElement>): void {
    const rows = toValue(options.rows)
    // Where the container's content begins, in viewport coordinates.
    const origin = container.getBoundingClientRect().top - container.scrollTop
    const list: RowRect[] = []

    for (const item of Array.from(items)) {
      const row = rows[Number(item.dataset.index)]

      if (!row) {
        continue
      }

      const rect = item.getBoundingClientRect()

      list.push({ row, top: rect.top - origin, height: rect.height })
    }

    cachedRects = list
    contentOrigin = origin
  }

  /**
   * Stale only when the rendered window moved: `data-index` is the row's position in the whole
   * list, so a count change and a virtual window sliding both land here, plain scrolling does not.
   */
  function isCacheStale(items: NodeListOf<HTMLElement>): boolean {
    if (items.length !== cachedRects.length) {
      return true
    }

    // The window is contiguous, so a matching length and start pin down every row inside it.
    return Number(items[0]?.dataset.index) !== cachedRects[0]?.row.index
  }

  /** The cached tops survive a scroll, the origin they are read against does not. */
  function refreshOrigin(): void {
    const container = getElement(options.container)

    if (container) {
      contentOrigin = container.getBoundingClientRect().top - container.scrollTop
    }
  }

  function resolveTarget(clientY: number): TreeDropTarget | undefined {
    const container = getElement(options.container)
    if (!container) {
      return undefined
    }

    const items = container.querySelectorAll<HTMLElement>('[data-tree-item]')

    if (isCacheStale(items)) {
      measureRows(container, items)
    }

    if (cachedRects.length === 0) {
      return undefined
    }

    const y = clientY - contentOrigin

    for (let index = 0; index < cachedRects.length; index++) {
      const entry = cachedRects[index]

      if (y >= entry.top && y <= entry.top + entry.height) {
        return toTarget(index, y)
      }
    }

    // Outside the rows only their first or last one can still be a target.
    const last = cachedRects.length - 1

    return y < cachedRects[0].top ? toTarget(0, y) : toTarget(last, y)
  }

  /**
   * The row after an expanded one sits inside its subtree, so `after` names the sibling below
   * instead; a row that is last at its level has no such sibling.
   */
  function afterRow(index: number, row: TreeFlatNode): TreeDropTarget {
    for (let at = index + 1; at < cachedRects.length; at++) {
      const depth = cachedRects[at].row.depth

      if (depth < row.depth) {
        break
      }

      if (depth === row.depth) {
        return { targetValue: cachedRects[at].row.key, position: 'before' }
      }
    }

    return { targetValue: row.key, position: 'after' }
  }

  function toTarget(index: number, y: number): TreeDropTarget | undefined {
    const dragged = value.value
    const entry = cachedRects[index]

    if (dragged === undefined || !entry) {
      return undefined
    }

    const row = entry.row
    const ratio = (y - entry.top) / (entry.height || 1)
    let target: TreeDropTarget

    // A gap is always spelled with the row below it, so both halves of it offer the same drop.
    if ((row.hasChildren || toValue(options.dropInsideLeaf)) && ratio > 0.25 && ratio < 0.75) {
      target = { targetValue: row.key, position: 'inside' }
    } else if (ratio < 0.5) {
      target = { targetValue: row.key, position: 'before' }
    } else {
      target = afterRow(index, row)
    }

    return options.canDrop(dragged, target.targetValue, target.position) ? target : undefined
  }

  function scheduleExpand(next: TreeDropTarget | undefined): void {
    if (!next || next.position !== 'inside') {
      clearExpand()
      return
    }

    if (expandValue === next.targetValue) {
      return
    }

    clearExpand()
    expandValue = next.targetValue

    expandTimer = setTimeout(() => {
      expandTimer = undefined

      if (expandValue !== undefined) {
        options.onExpand(expandValue)
      }
    }, EXPAND_DELAY)
  }

  function clearExpand(): void {
    if (expandTimer !== undefined) {
      clearTimeout(expandTimer)
      expandTimer = undefined
    }

    expandValue = undefined
  }

  /** Anything that scrolls moves rows under a pointer that never moved, the wheel included. */
  function followScroll(): void {
    if (value.value === undefined) {
      return
    }

    refreshOrigin()
    target.value = resolveTarget(y.value)
  }

  /** A drag released outside the window still has to end: the capture keeps the pointerup coming. */
  function capturePointer(pointerId: number): void {
    const container = getElement(options.container)

    if (!container) {
      return
    }

    container.addEventListener('lostpointercapture', onLostCapture)
    container.setPointerCapture?.(pointerId)
    captured = { el: container, pointerId }
  }

  function releasePointer(): void {
    const held = captured

    captured = undefined

    if (!held) {
      return
    }

    held.el.removeEventListener('lostpointercapture', onLostCapture)

    // After a pointerup the browser has released it already, where the call would throw.
    if (held.el.hasPointerCapture?.(held.pointerId)) {
      held.el.releasePointerCapture(held.pointerId)
    }
  }

  function onLostCapture(): void {
    if (armed || value.value !== undefined) {
      reset()
    }
  }

  /** Registered only once the hold is over, so it can never refuse a scroll the user meant. */
  function onTouchMove(event: TouchEvent): void {
    event.preventDefault()
  }

  function beginDrag(session: Armed): void {
    armed = undefined
    value.value = session.value
    x.value = session.x
    y.value = session.y

    const container = getElement(options.container)

    if (container) {
      container.addEventListener('scroll', followScroll, { passive: true })
    }

    window.addEventListener('scroll', followScroll, { passive: true })

    if (session.hold) {
      // The finger has not moved yet, so the scroll this refuses is still the browser's to start.
      window.addEventListener('touchmove', onTouchMove, { passive: false })
    }

    capturePointer(session.pointerId)

    target.value = resolveTarget(session.y)
    scheduleExpand(target.value)
  }

  function detach(): void {
    window.removeEventListener('pointermove', onPointerMove as EventListener)
    window.removeEventListener('pointerup', onPointerUp)
    window.removeEventListener('pointercancel', onPointerCancel)
    window.removeEventListener('keydown', onKeydown, true)
    window.removeEventListener('touchmove', onTouchMove)
    window.removeEventListener('scroll', followScroll)
    getElement(options.container)?.removeEventListener('scroll', followScroll)

    if (armed?.timer !== undefined) {
      clearTimeout(armed.timer)
    }

    releasePointer()
    armed = undefined
    cachedRects = []
    clearExpand()
  }

  function reset(): void {
    value.value = undefined
    target.value = undefined
    detach()
  }

  function onHoldEnd(session: Armed): void {
    session.timer = undefined

    if (armed === session) {
      beginDrag(session)
    }
  }

  function onPointerMove(event: PointerEvent): void {
    if (armed) {
      const session = armed
      const moved =
        Math.abs(event.clientY - session.y) >= DRAG_THRESHOLD ||
        Math.abs(event.clientX - session.x) >= DRAG_THRESHOLD

      if (!moved) {
        return
      }

      if (session.hold) {
        // A move inside the hold window means the finger was panning after all: leave it to the page.
        if (session.timer !== undefined) {
          clearTimeout(session.timer)
        }

        armed = undefined

        return
      }

      beginDrag(session)
    }

    if (value.value === undefined) {
      return
    }

    x.value = event.clientX
    y.value = event.clientY
    target.value = resolveTarget(event.clientY)
    scheduleExpand(target.value)
  }

  function onPointerUp(): void {
    const source = value.value
    const dropped = target.value

    // The browser fires a click of its own after the gesture, on the row the press started from.
    justDragged = source !== undefined

    reset()

    if (source !== undefined && dropped) {
      options.onCommit(source, dropped)
    }
  }

  function onPointerCancel(): void {
    reset()
  }

  function onKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Escape' || isCompositionKeydown(event)) {
      return
    }

    // Capture phase: the overlay manager listens on document later and must see the
    // event as consumed, otherwise cancelling a drag would also close the dialog.
    event.preventDefault()
    reset()
  }

  function onPointerDown(nodeValue: ComponentValue, event: PointerEvent): void {
    if (armed || toValue(options.enabled) === false || event.button !== 0) {
      return
    }

    const session: Armed = {
      value: nodeValue,
      x: event.clientX,
      y: event.clientY,
      pointerId: event.pointerId,
      // A finger or a stylus has to declare intent: a move that follows at once is a scroll.
      hold: event.pointerType !== 'mouse',
    }

    armed = session
    justDragged = false

    window.addEventListener('pointermove', onPointerMove as EventListener)
    window.addEventListener('pointerup', onPointerUp)
    window.addEventListener('pointercancel', onPointerCancel)
    window.addEventListener('keydown', onKeydown, true)

    if (session.hold) {
      session.timer = setTimeout(() => onHoldEnd(session), HOLD_DELAY)
    }
  }

  /** Whether the gesture that just ended moved a node, so its trailing click belongs to the drag. */
  function didDrag(): boolean {
    return justDragged
  }

  onScopeDispose(reset)

  return { value, target, x, y, onPointerDown, didDrag }
}
