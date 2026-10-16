import type {
  TreeDropPosition,
  TreeDropTarget,
  TreeFilterFn,
  TreeFlatNode,
  TreeMoveDetail,
  TreeModelValue,
  TreeOption,
  TreeOptions,
  TreeSelectableFn,
} from '../../components/tree/types'
import type { ComponentValue, MaybeElementRef } from '../../types/shared'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'
import { computed, onScopeDispose, shallowRef } from 'vue'
import { getElement } from '../../utils/dom.js'
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

function graftNode(
  node: TreeOption,
  loaded: Map<ComponentValue, TreeOptions>,
  childrenField: string,
): TreeOption {
  const own = node[childrenField]
  const fromData = Array.isArray(own) && own.length > 0
  const source: TreeOptions = fromData ? own : (loaded.get(node.value) ?? [])
  const children: TreeOptions = []
  let changed = !fromData && loaded.has(node.value)

  for (const child of source) {
    const grafted = graftNode(child, loaded, childrenField)

    if (grafted !== child) {
      changed = true
    }

    children.push(grafted)
  }

  return changed ? { ...node, [childrenField]: children } : node
}

/**
 * Copies lazily loaded children into the tree the index walks. Children already in `data` win over
 * a cached request, and a node the graft does not touch keeps its identity, so consumer code that
 * holds onto a node still recognises it.
 */
export function graftLoadedChildren(
  data: TreeOptions,
  loaded: Map<ComponentValue, TreeOptions>,
  childrenField: string,
): TreeOptions {
  if (loaded.size === 0) {
    return data
  }

  let changed = false
  const next = data.map((node) => {
    const grafted = graftNode(node, loaded, childrenField)

    if (grafted !== node) {
      changed = true
    }

    return grafted
  })

  return changed ? next : data
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
  /** A childless row whose children the tree still has to fetch keeps its arrow. */
  canLoad?: MaybeRefOrGetter<((value: ComponentValue) => boolean) | undefined>
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
    const canLoad = toValue(options.canLoad)
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
        hasChildren: meta.children.length > 0 || canLoad?.(value) === true,
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
  /** Keep every node on its own: no cascade, and no parent lit up by its children. */
  checkStrictly?: MaybeRefOrGetter<boolean | undefined>
  /** Refuses a node a place in the selection, without the rest of the disabled behaviour. */
  selectable?: MaybeRefOrGetter<TreeSelectableFn | undefined>
}

export interface TreeToggleResult {
  value: TreeModelValue
  /** Parents left partially checked by the new selection, empty without the cascade. */
  halfCheckedValues: ComponentValue[]
}

export interface UseTreeSelectionReturn {
  checked: ComputedRef<Set<ComponentValue>>
  indeterminate: ComputedRef<Set<ComponentValue>>
  toggle: (value: ComponentValue) => TreeToggleResult
  /**
   * Extend the selection to `value`: the span between the anchor and it in document order, both
   * ends included and disabled nodes left out. Without an anchor it toggles instead. Meant for a
   * shift-click.
   */
  extend: (value: ComponentValue) => TreeToggleResult
  /** Whether a key could join the selection at all, disabled and refused nodes aside. */
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

/**
 * Post-order pass over the pre-order node list. A node with selectable descendants
 * counts as checked when every one of them is, which is what makes a parent light up
 * after its children were picked one by one. One pass, so cascades stay O(n).
 */
function derive(
  list: TreeNodeMeta[],
  selected: ReadonlySet<ComponentValue>,
  selectable: (meta: TreeNodeMeta) => boolean,
): DerivedState {
  const checked = new Set<ComponentValue>()
  const indeterminate = new Set<ComponentValue>()
  const stats = new Map<TreeNodeMeta, { total: number; hit: number }>()

  for (let i = list.length - 1; i >= 0; i--) {
    const meta = list[i]
    let total = 0
    let hit = 0

    for (const child of meta.children) {
      const childStat = stats.get(child)
      total += childStat?.total ?? 0
      hit += childStat?.hit ?? 0
    }

    const takes = selectable(meta)
    const isChecked = total > 0 ? hit === total : selected.has(meta.node.value)

    // A refused node is only refused the clicks and the ranges: one the model already carries stays
    // selected, and one it does not never lands there. A partial subtree is still reported, so a
    // parent can say that some of what it holds is selected.
    if (isChecked && (takes || selected.has(meta.node.value))) {
      checked.add(meta.node.value)
    } else if (hit > 0) {
      indeterminate.add(meta.node.value)
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
  /**
   * Where the selection last landed and how far the last extension reached. A shift-click drops
   * the span that extension covered before taking the new one, so the range follows the pointer
   * rather than piling up.
   */
  let anchor: ComponentValue | undefined
  let current: ComponentValue | undefined

  /** A node takes part in the selection unless it is disabled or the tree refuses it. */
  function selectable(meta: TreeNodeMeta): boolean {
    return meta.node.disabled !== true && toValue(options.selectable)?.(meta.node) !== false
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

    return derive(toValue(options.index).list, selected.value, selectable)
  })

  /** Document order, so the emitted array never depends on the order the user clicked. */
  function toToggleResult(list: TreeNodeMeta[], result: DerivedState): TreeToggleResult {
    return {
      value: list
        .filter((item) => result.checked.has(item.node.value))
        .map((item) => item.node.value),
      halfCheckedValues: list
        .filter((item) => result.indeterminate.has(item.node.value))
        .map((item) => item.node.value),
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

    // A clearing click leaves the anchor where the last selection put it, so a shift-click after
    // it still extends from a row the selection knows about.
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

    for (let i = list.indexOf(meta); i < meta.end; i++) {
      const item = list[i]

      if (!selectable(item)) {
        continue
      }

      if (willCheck) {
        next.add(item.node.value)
      } else {
        next.delete(item.node.value)
      }
    }

    return toToggleResult(list, derive(list, next, selectable))
  }

  /** The nodes between two of them in document order, both ends included, either way round. */
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

    // Undo what the last extension covered before taking the new span, the way React Aria's
    // `extendSelection` does: it is what lets a shift-click back inside the span shrink it instead
    // of leaving the wider range behind. The anchor itself comes back in the pass below.
    for (const item of span(from, reached ?? to)) {
      next.delete(item.node.value)
    }

    for (const item of span(from, to)) {
      if (selectable(item)) {
        next.add(item.node.value)
      }
    }

    current = value

    return toValue(options.checkStrictly)
      ? toToggleResult(list, { checked: next, indeterminate: new Set() })
      : toToggleResult(list, derive(list, next, selectable))
  }

  return {
    checked: computed(() => state.value.checked),
    indeterminate: computed(() => state.value.indeterminate),
    toggle,
    extend,
    isSelectable,
  }
}

/**
 * Walks up from `value` looking for `ancestorValue`. Reached in O(depth) instead of scanning
 * `index.list`, which the hit test runs on every pointer move.
 */
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

/**
 * Removes the node and rebuilds only the lists and nodes along its path, so untouched
 * subtrees keep their identity and a reference comparison still recognises them.
 */
function removeNode(
  list: TreeOptions,
  childrenField: string,
  value: ComponentValue,
  parentValue?: ComponentValue,
): Removal | undefined {
  const at = list.findIndex((node) => node.value === value)

  if (at !== -1) {
    return {
      list: [...list.slice(0, at), ...list.slice(at + 1)],
      node: list[at],
      parentValue,
      index: at,
    }
  }

  for (let i = 0; i < list.length; i++) {
    const children = list[i][childrenField]

    if (!Array.isArray(children)) {
      continue
    }

    const result = removeNode(children, childrenField, value, list[i].value)

    if (!result) {
      continue
    }

    const next = [...list]
    next[i] = { ...list[i], [childrenField]: result.list }

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
  childrenField: string,
  target: TreeDropTarget,
  node: TreeOption,
  parentValue?: ComponentValue,
): Insertion | undefined {
  const at = list.findIndex((item) => item.value === target.targetValue)

  if (at !== -1) {
    const next = [...list]

    if (target.position === 'inside') {
      const raw = next[at][childrenField]
      const children = Array.isArray(raw) ? raw : []

      next[at] = { ...next[at], [childrenField]: [...children, node] }

      return { list: next, parentValue: next[at].value, index: children.length }
    }

    const index = target.position === 'after' ? at + 1 : at
    next.splice(index, 0, node)

    return { list: next, parentValue, index }
  }

  for (let i = 0; i < list.length; i++) {
    const children = list[i][childrenField]

    if (!Array.isArray(children)) {
      continue
    }

    const result = insertNode(children, childrenField, target, node, list[i].value)

    if (!result) {
      continue
    }

    const next = [...list]
    next[i] = { ...list[i], [childrenField]: result.list }

    return { ...result, list: next }
  }

  return undefined
}

export interface TreeMoveResult {
  data: TreeOptions
  detail: TreeMoveDetail
}

/**
 * Relocates a node relative to a target row.
 *
 * The node is detached before the target is looked up, which is what rejects the whole
 * family of invalid drops for free: the node itself and its own descendants are no longer
 * in the tree, so the insertion pass simply never finds them.
 */
export function moveTreeNode(
  data: TreeOptions,
  childrenField: string,
  value: ComponentValue,
  target: TreeDropTarget,
): TreeMoveResult | undefined {
  const removal = removeNode(data, childrenField, value)

  if (!removal) {
    return undefined
  }

  const insertion = insertNode(removal.list, childrenField, target, removal.node)

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

/** Movement before the pointer is treated as a drag, so a plain click never arms it. */
const DRAG_THRESHOLD = 5

/**
 * How long a touch or pen must hold still before it drags. A finger that moves inside this window
 * is panning the page, and by then the browser has taken the gesture for a scroll.
 */
const HOLD_DELAY = 300

/** How long a collapsed parent must be hovered before it opens. */
const EXPAND_DELAY = 500

export interface UseTreeDragOptions {
  container: MaybeElementRef<HTMLElement>
  /** Rendered rows, the only ones the pointer can be measured against. */
  rows: MaybeRefOrGetter<TreeFlatNode[]>
  /** Whole-session gate: off while searching, while disabled, or without the prop. */
  enabled: MaybeRefOrGetter<boolean>
  /** Offer `inside` in the middle of a row without children, so a drop can give it some. */
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

/**
 * One row measured once, in content coordinates rather than viewport ones: the numbers stay the
 * same while the container scrolls, so a cached rect survives a scroll of either kind.
 */
interface RowRect {
  row: TreeFlatNode
  top: number
  height: number
}

/**
 * A press that has not become a drag yet. A mouse converts it on the first move past the
 * threshold; touch and pen wait out `HOLD_DELAY` first.
 */
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
   * The cache is stale only when the rendered window itself moved. `data-index` is the row's
   * position in the whole list, so a row count change (a hover expand) and a window sliding
   * under a virtual list both land here, while plain scrolling does not — and plain scrolling
   * is exactly what the content coordinates already absorb.
   */
  function isCacheStale(items: NodeListOf<HTMLElement>): boolean {
    if (items.length !== cachedRects.length) {
      return true
    }

    // The window is contiguous, so a matching length and start pin down every row inside it.
    return Number(items[0]?.dataset.index) !== cachedRects[0]?.row.index
  }

  /**
   * The cached tops are content offsets and survive any scroll, but the origin they are read
   * against does not: without this, a scrolled list resolves the pointer against where the rows
   * used to be, and the drop lands a scroll away from the row underneath it.
   */
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
   * The row after an expanded one sits inside its subtree, while the slot its own `after` names
   * lies past all of it: the sibling below it. A row that is last at its level has no such
   * sibling, so its `after` stays the only way to say it.
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
    window.removeEventListener('keydown', onKeydown)
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
    if (event.key === 'Escape') {
      reset()
    }
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
    window.addEventListener('keydown', onKeydown)

    if (session.hold) {
      session.timer = setTimeout(() => onHoldEnd(session), HOLD_DELAY)
    }
  }

  /**
   * Whether the gesture that just ended moved a node. The click the browser fires at the end of
   * it belongs to the drag, not to the row it started from, until the next press clears this.
   */
  function didDrag(): boolean {
    return justDragged
  }

  onScopeDispose(reset)

  return { value, target, x, y, onPointerDown, didDrag }
}
