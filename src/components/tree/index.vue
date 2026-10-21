<script lang="ts" setup>
import type { ListKeyboardMap } from '../../composables/_internal/use-list-keyboard-controller'
import type { TreeMatched } from '../../composables/_internal/use-tree'
import type { ComponentValue } from '../../types/shared/props'
import type {
  TreeDropPosition,
  TreeDropTarget,
  TreeEmits,
  TreeFlatNode,
  TreeModelValue,
  TreeOption,
  TreeOptions,
  TreeProps,
} from './types'
import { computed, shallowRef, useSlots, watch } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListNavigation } from '../../composables/_internal/use-list-navigation.js'
import {
  graftLoadedChildren,
  isTreeDescendant,
  moveTreeNode,
  useTreeDrag,
  useTreeIndex,
  useTreeMatched,
  useTreeRows,
  useTreeSearch,
  useTreeSelection,
} from '../../composables/_internal/use-tree.js'
import { useVirtualList } from '../../composables/use-virtual-list.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNumber } from '../../utils/is.js'
import PLoadingMask from '../_internal/loading-mask.vue'
import PTreeNode from '../_internal/tree-node.vue'
import PSearchInput from '../search-input/index.vue'
import PTeleport from '../teleport/index.vue'

interface RenderEntry extends TreeFlatNode {
  start?: number
  id: string
  active: boolean
}

defineOptions({
  name: 'PTree',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<TreeProps>(), {
  data: () => [],
  multiple: false,
  checkStrictly: false,
  showSwitcher: true,
  showCheckbox: true,
  disabled: false,
  expandOnly: false,
  draggable: false,
  dropInsideLeaf: false,
  virtual: false,
  itemSize: 32,
  overScan: 4,
  indent: 20,
  childrenField: 'children',
  lazy: false,
  loading: false,
  filterable: false,
  highlightMatch: false,
  searchPlaceholder: 'Search',
  defaultSearchValue: '',
})

const emits = defineEmits<TreeEmits>()

const uid = getUniqueId()
/** A query still on its way shows no row at all, rather than letting the local filter answer it. */
const NO_MATCHED: TreeMatched = { visible: new Set(), exact: new Set() }
const KEYMAP: ListKeyboardMap = {
  ArrowDown: 'next',
  ArrowUp: 'previous',
  ArrowRight: 'enter-child',
  ArrowLeft: 'leave-parent',
  End: 'last',
  Enter: 'activate',
  Home: 'first',
  ' ': 'activate',
}

const containerRef = shallowRef<HTMLElement>()
const internalSearchValue = shallowRef(props.defaultSearchValue ?? '')
const searchValue = computed(() => props.searchValue ?? internalSearchValue.value)
const internalExpandedKeys = shallowRef<ComponentValue[]>([...(props.defaultExpandedKeys ?? [])])
const loadedChildren = shallowRef(new Map<ComponentValue, TreeOptions>())
const loadingKeys = shallowRef(new Set<ComponentValue>())

const treeData = computed(() =>
  graftLoadedChildren(props.data, loadedChildren.value, props.childrenField),
)
const expandedKeys = computed(() => props.expandedKeys ?? internalExpandedKeys.value)
const expanded = computed(() => new Set(expandedKeys.value))
const highlightQuery = computed(() => (props.highlightMatch ? searchValue.value.trim() : ''))

const containerStyle = computed(() => {
  const height = props.height

  if (height == null) {
    return undefined
  }

  return { height: isNumber(height) ? height + 'px' : height }
})
/** Painted only while focused: a marker on a blurred element lies about where the focus is. */
const focused = shallowRef(false)
/** Dragging while a query is active would drop a node relative to an incomplete neighbourhood. */
const dragEnabled = computed(
  () => props.draggable && !props.disabled && searchValue.value.trim().length === 0,
)

const slots = useSlots()

const hasNodeSlot = computed(
  () =>
    !!slots['node-switcher'] ||
    !!slots['node-icon'] ||
    !!slots['node-content'] ||
    !!slots['node-suffix'],
)

const {
  matches: remoteMatches,
  remote: remoteMode,
  pending: searchPending,
  active: remoteActive,
} = useTreeSearch({
  query: () => searchValue.value,
  remoteFilter: () => props.remoteFilter,
})

const searchData = computed(() =>
  remoteActive.value ? (remoteMatches.value ?? []) : treeData.value,
)

const index = useTreeIndex(
  () => searchData.value,
  () => props.childrenField,
)
const localMatched = useTreeMatched(
  index,
  () => searchValue.value,
  () => props.filter,
)

const matched = computed<TreeMatched>(() => {
  if (!remoteMode.value) {
    return localMatched.value
  }

  if (!remoteActive.value) {
    return NO_MATCHED
  }

  // The whole returned forest shows: an ancestor is as much a hit as the node at the end of it.
  const visible = new Set(index.value.list.map((meta) => meta.node.value))

  return { visible, exact: visible }
})

const { checked, indeterminate, toggle, extend, isSelectable } = useTreeSelection({
  index,
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
  checkStrictly: () => props.checkStrictly,
  selectable: () => props.selectable,
})
const rows = useTreeRows(index, {
  query: () => searchValue.value,
  expanded,
  matched: () => matched.value.visible,
  exactMatched: () => matched.value.exact,
  matchesOnly: () => props.searchMatchesOnly,
  canLoad: () => canLoad,
})

/** Not `reactive()`: the virtualizer would get a deep proxy of the rows instead of the rows. */
const virtualOptions = {
  dataKey: 'key',
  get enabled() {
    return props.virtual
  },
  get items() {
    return rows.value
  },
  get itemSize() {
    return props.itemSize
  },
  get overScan() {
    return props.overScan
  },
}

const rowByKey = computed(() => {
  const result = new Map<ComponentValue, TreeFlatNode>()
  rows.value.forEach((row) => result.set(row.key, row))
  return result
})

const { totalSize, virtualItems, scrollToIndex } = useVirtualList(containerRef, virtualOptions)

const contentStyle = computed(() =>
  props.virtual ? { height: totalSize.value + 'px' } : undefined,
)

/** Keyboard only: a pointer-set marker would outlive the pointer and duplicate `checked`. */
const { activeIndex, dispatch, setActiveIndex } = useListNavigation({
  count: () => rows.value.length,
  isDisabled: (index) => isNodeDisabled(rows.value[index]),
  onActivateItem: (index) => {
    const row = rows.value[index]
    if (row) {
      onCheck(row)
    }
  },
  onRight: (index) => {
    const row = rows.value[index]
    if (!row) {
      return
    }

    if (row.hasChildren && !row.expanded) {
      setExpandedByValue(row.key, true)
      return
    }

    if (row.hasChildren && index + 1 < rows.value.length) {
      setActiveIndex(index + 1)
      scrollRowIntoView(index + 1)
    }
  },
  onLeft: () => {
    const row = rows.value[activeIndex.value]
    if (!row) {
      return
    }

    if (row.hasChildren && row.expanded) {
      setExpandedByValue(row.key, false)
      return
    }

    if (row.parentValue === undefined) {
      return
    }

    const parentIndex = getRow(row.parentValue)?.index
    if (parentIndex === undefined) {
      return
    }

    setActiveIndex(parentIndex)
    scrollRowIntoView(parentIndex)
  },
  scrollToIndex: scrollRowIntoView,
})

const activeDescendant = computed(() =>
  activeIndex.value >= 0 ? uid + '-' + activeIndex.value : undefined,
)
const renderEntries = computed<RenderEntry[]>(() => {
  if (props.virtual) {
    return virtualItems.value.flatMap((virtualItem) => {
      const row = rows.value[virtualItem.index]

      return row
        ? [
            {
              ...row,
              id: uid + '-' + row.index,
              start: virtualItem.start,
              active: focused.value && activeIndex.value === row.index,
            },
          ]
        : []
    })
  }

  const entries: RenderEntry[] = []

  for (const row of rows.value) {
    entries.push({
      ...row,
      id: uid + '-' + row.index,
      active: focused.value && activeIndex.value === row.index,
    })
  }

  return entries
})

const { onKeydown } = useListKeyboardController({
  keymap: KEYMAP,
  enabled: () => !props.disabled && !props.loading,
  onCommand: (command) => dispatch(command),
})
const {
  value: dragValue,
  target: dropTarget,
  x: dragX,
  y: dragY,
  onPointerDown: onDragPointerdown,
  didDrag,
} = useTreeDrag({
  container: containerRef,
  rows: () => rows.value,
  enabled: () => dragEnabled.value,
  dropInsideLeaf: () => props.dropInsideLeaf,
  canDrop,
  onExpand: (value) => {
    if (getRow(value)?.hasChildren) {
      setExpandedByValue(value, true)
    }
  },
  onCommit,
})

const dragNode = computed(() =>
  dragValue.value === undefined ? undefined : index.value.byValue.get(dragValue.value)?.node,
)

function canLoad(value: ComponentValue): boolean {
  if (!props.lazy || !props.load || loadedChildren.value.has(value)) {
    return false
  }

  const meta = index.value.byValue.get(value)

  return meta !== undefined && meta.node.isLeaf !== true && meta.children.length === 0
}
function commitLoading(value: ComponentValue, next: boolean): void {
  const keys = new Set(loadingKeys.value)

  if (next) {
    keys.add(value)
  } else {
    keys.delete(value)
  }

  loadingKeys.value = keys
}
/** Reads the open set rather than the click, so a drag hover and a controlled key reach it too. */
function ensureLoaded(value: ComponentValue): void {
  const load = props.load
  const meta = index.value.byValue.get(value)

  if (!load || !meta || loadingKeys.value.has(value) || !canLoad(value)) {
    return
  }

  const parentValue = meta.parentValue

  commitLoading(value, true)

  load(
    {
      node: meta.node,
      depth: meta.depth,
      parent: parentValue === undefined ? undefined : index.value.byValue.get(parentValue)?.node,
    },
    (children) => {
      commitLoading(value, false)

      const next = new Map(loadedChildren.value)
      next.set(value, children)
      loadedChildren.value = next
    },
    () => commitLoading(value, false),
  )
}
function getRow(value: ComponentValue): TreeFlatNode | undefined {
  return rowByKey.value.get(value)
}

function commitExpandedKeys(next: ComponentValue[]): void {
  internalExpandedKeys.value = next
  emits('update:expandedKeys', next)
}

function setExpandedByValue(value: ComponentValue, next: boolean): void {
  if (expanded.value.has(value) === next) {
    return
  }

  const current = expandedKeys.value
  commitExpandedKeys(next ? [...current, value] : current.filter((key) => key !== value))

  const node = index.value.byValue.get(value)?.node
  if (!node) {
    return
  }

  if (next) {
    emits('expand', { value, node })
    return
  }

  emits('collapse', { value, node })
}

function toggleNode(row: TreeFlatNode): void {
  if (!row.hasChildren) {
    return
  }

  setExpandedByValue(row.key, !row.expanded)
}

function expandAll(): void {
  commitExpandedKeys(
    index.value.list.filter((meta) => meta.children.length > 0).map((meta) => meta.node.value),
  )
}

function collapseAll(): void {
  commitExpandedKeys([])
}

function toValues(value: TreeModelValue): ComponentValue[] {
  if (Array.isArray(value)) {
    return value
  }

  return value == null ? [] : [value]
}

function onCheck(row: TreeFlatNode, event?: MouseEvent): void {
  if (props.disabled || !isSelectable(row.key)) {
    return
  }

  const next = event?.shiftKey ? extend(row.key) : toggle(row.key)
  const checkedValues = toValues(next.value)

  emits('update:modelValue', next.value)
  emits('change', {
    value: row.key,
    node: row.node,
    checked: checkedValues.includes(row.key),
    checkedValues,
    halfCheckedValues: next.halfCheckedValues,
  })
}

function onSearchInput(value: string): void {
  if (props.loading) {
    return
  }

  internalSearchValue.value = value
  emits('update:searchValue', value)
}
function isNodeDisabled(row: TreeFlatNode): boolean {
  return props.disabled || row.node.disabled === true
}

function scrollRowIntoView(index: number): void {
  if (props.virtual) {
    scrollToIndex(index, { align: 'auto', behavior: 'instant' })
    return
  }

  const row = containerRef.value?.querySelector(`[data-tree-item][data-index="${index}"]`)

  row?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
}
function isDragClick(): boolean {
  return didDrag()
}

function onRowClick(value: ComponentValue, event?: MouseEvent): void {
  if (isDragClick()) {
    return
  }

  const row = getRow(value)

  if (!row) {
    return
  }

  if (props.expandOnly && !event?.shiftKey) {
    if (row.hasChildren) {
      toggleNode(row)
    }

    if (props.multiple || row.hasChildren) {
      return
    }
  }

  onCheck(row, event)
}

function onSwitcherClick(value: ComponentValue): void {
  if (isDragClick()) {
    return
  }

  const row = getRow(value)

  if (row) {
    toggleNode(row)
  }
}

function onCheckboxClick(value: ComponentValue, event?: MouseEvent): void {
  if (isDragClick()) {
    return
  }

  const row = getRow(value)

  if (row) {
    onCheck(row, event)
  }
}

function scrollToKey(value: ComponentValue): void {
  const index = getRow(value)?.index

  if (index !== undefined) {
    scrollRowIntoView(index)
  }
}

function setActiveKey(value: ComponentValue): void {
  const at = getRow(value)?.index

  // Without the scroll, aria-activedescendant can point at a row outside the virtual window.
  if (at === undefined) {
    return
  }

  setActiveIndex(at)
  scrollRowIntoView(at)
}
/** The whole index, not the rendered rows: a collapsed subtree still holds checked nodes. */
function getCheckedKeys(includeIndeterminate = false): ComponentValue[] {
  const result: ComponentValue[] = []

  for (const meta of index.value.list) {
    const value = meta.node.value

    if (checked.value.has(value) || (includeIndeterminate && indeterminate.value.has(value))) {
      result.push(value)
    }
  }

  return result
}

function getVisibleKeys(): ComponentValue[] {
  return rows.value.map((row) => row.key)
}
function canDrop(
  value: ComponentValue,
  targetValue: ComponentValue,
  position: TreeDropPosition,
): boolean {
  const meta = index.value.byValue.get(targetValue)
  const dragNode = index.value.byValue.get(value)?.node

  // Structural: never on itself or inside its own subtree, and never inside an unloaded parent —
  // the tree a drop proposes would lose the subtree nobody has seen yet.
  if (
    !meta ||
    !dragNode ||
    targetValue === value ||
    isTreeDescendant(index.value, value, targetValue) ||
    (position === 'inside' && canLoad(targetValue))
  ) {
    return false
  }

  if (props.allowDrop) {
    return props.allowDrop({
      dragValue: value,
      dragNode,
      targetValue,
      targetNode: meta.node,
      position,
    })
  }

  return meta.node.disabled !== true
}
function getData(value: ComponentValue): TreeOption | undefined {
  return index.value.byValue.get(value)?.node
}
/** The caller owns `data`: a drop only proposes the next tree, and a no-op move is silent. */
function onCommit(value: ComponentValue, target: TreeDropTarget): void {
  // The grafted tree, not the prop: nodes that arrived through `load` live only in there.
  const result = moveTreeNode(treeData.value, props.childrenField, value, target)

  if (!result) {
    return
  }

  emits('update:data', result.data)
  emits('move', result.detail)

  if (target.position === 'inside') {
    setExpandedByValue(target.targetValue, true)
  }
}

// `treeData` too: a key below a parent still on its way only becomes loadable once it arrives.
watch(
  [expanded, treeData],
  ([keys]) => {
    for (const value of keys) {
      ensureLoaded(value)
    }
  },
  { immediate: true },
)

defineExpose({
  focus: () => containerRef.value?.focus(),
  scrollToKey,
  setActiveKey,
  expandKey: (value: ComponentValue) => setExpandedByValue(value, true),
  collapseKey: (value: ComponentValue) => setExpandedByValue(value, false),
  expandAll,
  collapseAll,
  getCheckedKeys,
  getVisibleKeys,
  getData,
  activeIndex,
})
</script>

<template>
  <div data-tree class="pxd-tree-root w-full max-w-full">
    <div v-if="filterable" data-tree-search class="pxd-tree--search mbe-1">
      <slot name="search">
        <PSearchInput
          :model-value="searchValue"
          :placeholder="searchPlaceholder"
          :loading="loading || searchPending"
          @update:model-value="onSearchInput"
        />
      </slot>
    </div>

    <div
      ref="containerRef"
      role="tree"
      tabindex="0"
      class="pxd-tree m-0 relative w-full max-w-full rounded-inherit bg-background-100 outline-none"
      :class="{ 'min-h-22': loading && !rows.length }"
      :style="containerStyle"
      :aria-busy="loading"
      :aria-multiselectable="multiple || undefined"
      :aria-activedescendant="focused ? activeDescendant : undefined"
      v-bind="$attrs"
      @keydown="onKeydown"
      @focus="focused = true"
      @blur="focused = false"
    >
      <div class="pxd-tree--content w-full" :class="{ relative: virtual }" :style="contentStyle">
        <div
          v-for="entry in renderEntries"
          :key="entry.key"
          :data-checked="checked.has(entry.key)"
          class="pxd-tree--row w-full"
          :class="{ 'left-0 top-0 absolute': virtual }"
          :style="virtual ? { transform: 'translateY(' + entry.start + 'px)' } : undefined"
        >
          <PTreeNode
            v-if="hasNodeSlot"
            :id="entry.id"
            :node="entry.node"
            :value="entry.key"
            :depth="entry.depth"
            :index="entry.index"
            :has-children="entry.hasChildren"
            :expanded="entry.expanded"
            :loading="loadingKeys.has(entry.key)"
            :checked="checked.has(entry.key)"
            :indeterminate="indeterminate.has(entry.key)"
            :active="entry.active"
            :multiple="multiple"
            :disabled="disabled"
            :show-switcher="showSwitcher"
            :show-checkbox="showCheckbox"
            :set-size="rows.length"
            :indent="indent"
            :selectable="isSelectable(entry.key)"
            :highlight-query="highlightQuery"
            :item-class="itemClass"
            :draggable="dragEnabled"
            :dragging="entry.key === dragValue"
            :drop-position="dropTarget?.targetValue === entry.key ? dropTarget.position : undefined"
            @row-click="onRowClick"
            @drag-pointerdown="onDragPointerdown"
            @check="onCheckboxClick"
            @toggle="onSwitcherClick"
          >
            <template v-if="$slots['node-switcher']" #node-switcher="scope">
              <slot name="node-switcher" v-bind="scope" />
            </template>

            <template v-if="$slots['node-icon']" #node-icon="scope">
              <slot name="node-icon" v-bind="scope" />
            </template>

            <template v-if="$slots['node-content']" #node-content="scope">
              <slot name="node-content" v-bind="scope" />
            </template>

            <template v-if="$slots['node-suffix']" #node-suffix="scope">
              <slot name="node-suffix" v-bind="scope" />
            </template>
          </PTreeNode>

          <PTreeNode
            v-else
            :id="entry.id"
            :node="entry.node"
            :value="entry.key"
            :depth="entry.depth"
            :index="entry.index"
            :has-children="entry.hasChildren"
            :expanded="entry.expanded"
            :loading="loadingKeys.has(entry.key)"
            :checked="checked.has(entry.key)"
            :indeterminate="indeterminate.has(entry.key)"
            :active="entry.active"
            :multiple="multiple"
            :disabled="disabled"
            :show-switcher="showSwitcher"
            :show-checkbox="showCheckbox"
            :set-size="rows.length"
            :indent="indent"
            :selectable="isSelectable(entry.key)"
            :highlight-query="highlightQuery"
            :item-class="itemClass"
            :draggable="dragEnabled"
            :dragging="entry.key === dragValue"
            :drop-position="dropTarget?.targetValue === entry.key ? dropTarget.position : undefined"
            @row-click="onRowClick"
            @drag-pointerdown="onDragPointerdown"
            @check="onCheckboxClick"
            @toggle="onSwitcherClick"
          />
        </div>
      </div>

      <PLoadingMask v-if="loading" />

      <div
        v-else-if="!rows.length"
        class="pxd-tree--empty py-8.5 text-sm text-center text-foreground-secondary"
      >
        <slot name="empty" />
      </div>
    </div>

    <PTeleport>
      <div
        v-if="dragValue !== undefined"
        aria-hidden="true"
        class="pxd-tree--drag-preview px-2 py-1 text-sm shadow-lg pointer-events-none fixed z-50 rounded-md border border-gray-300 bg-background-100 text-foreground"
        :style="{ left: dragX + 'px', top: dragY + 'px' }"
      >
        <slot name="node-drag-preview" :node="dragNode">
          {{ dragNode?.label }}
        </slot>
      </div>
    </PTeleport>
  </div>
</template>

<style lang="postcss">
.pxd-tree--row[data-checked='true'] {
  & + & > .pxd-tree--node {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }

  &:has(+ &) > .pxd-tree--node {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
}

@media (hover: hover) {
  .pxd-tree--row:has(> .pxd-tree--node:is([data-checked='true'], :hover)):has(
      + .pxd-tree--row > .pxd-tree--node:is([data-checked='true'], :hover)
    )
    > .pxd-tree--node {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }

  .pxd-tree--row:has(> .pxd-tree--node:is([data-checked='true'], :hover))
    + .pxd-tree--row
    > .pxd-tree--node:is([data-checked='true'], :hover) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
</style>
