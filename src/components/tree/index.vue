<script lang="ts" setup>
import type { ListKeyboardMap } from '../../composables/_internal/use-list-keyboard-controller'
import type { ComponentValue } from '../../types/shared'
import type { TreeEmits, TreeFlatNode, TreeModelValue, TreeOption, TreeProps } from './types'
import { computed, reactive, shallowRef, useSlots } from 'vue'
import { useListKeyboardController } from '../../composables/_internal/use-list-keyboard-controller.js'
import { useListNavigation } from '../../composables/_internal/use-list-navigation.js'
import {
  useTreeIndex,
  useTreeMatched,
  useTreeRows,
} from '../../composables/_internal/use-tree-rows.js'
import { useTreeSelection } from '../../composables/_internal/use-tree-selection.js'
import { useVirtualList } from '../../composables/use-virtual-list.js'
import { getElement } from '../../utils/dom.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNumber } from '../../utils/is.js'
import PTreeNode from '../_internal/tree-node.vue'
import PSearchInput from '../search-input/index.vue'

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
  disabled: false,
  expandOnClick: true,
  virtual: false,
  itemSize: 32,
  overScan: 4,
  indent: 16,
  childrenField: 'children',
  filterable: false,
  highlightMatch: false,
  searchPlaceholder: 'Search',
})

const emits = defineEmits<TreeEmits>()

const uid = getUniqueId()
const containerRef = shallowRef<HTMLElement>()
const searchValue = shallowRef('')
const internalExpandedKeys = shallowRef<ComponentValue[]>([...(props.defaultExpandedKeys ?? [])])

const index = useTreeIndex(
  () => props.data,
  () => props.childrenField,
)

const matched = useTreeMatched(
  index,
  () => searchValue.value,
  () => props.filter,
)

const { checked, indeterminate, toggle } = useTreeSelection({
  index,
  modelValue: () => props.modelValue,
  multiple: () => props.multiple,
})

const expandedKeys = computed(() => props.expandedKeys ?? internalExpandedKeys.value)
const expanded = computed(() => new Set(expandedKeys.value))

const rows = useTreeRows(index, {
  query: () => searchValue.value,
  expanded,
  matched,
  checked,
  indeterminate,
})

const rowByKey = computed(() => {
  const result = new Map<ComponentValue, TreeFlatNode>()
  rows.value.forEach((row) => result.set(row.key, row))
  return result
})

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

function onCheck(row: TreeFlatNode): void {
  if (props.disabled || row.node.disabled) {
    return
  }

  const next = toggle(row.key)
  const checkedValues = toValues(next)

  emits('update:modelValue', next)
  emits('change', {
    value: row.key,
    node: row.node,
    checked: checkedValues.includes(row.key),
    checkedValues,
  })
}

function onSearchInput(value: string): void {
  searchValue.value = value
  emits('update:searchValue', value)
}
const virtualOptions = reactive({
  dataKey: 'key',
  enabled: () => props.virtual,
  get items() {
    return rows.value
  },
  get itemSize() {
    return props.itemSize
  },
  get overScan() {
    return props.overScan
  },
})

const { totalSize, virtualItems, scrollToIndex } = useVirtualList(containerRef, virtualOptions)

const highlightQuery = computed(() => (props.highlightMatch ? searchValue.value.trim() : ''))

const containerStyle = computed(() => {
  const height = props.height

  if (height == null) {
    return undefined
  }

  return { height: isNumber(height) ? height + 'px' : height }
})

const contentStyle = computed(() =>
  props.virtual ? { height: totalSize.value + 'px' } : undefined,
)

function isNodeDisabled(row: TreeFlatNode): boolean {
  return props.disabled || row.node.disabled === true
}

function scrollRowIntoView(index: number): void {
  if (props.virtual) {
    scrollToIndex(index, { align: 'auto' })
    return
  }

  const selector = '[data-tree-item][data-index="' + index + '"]'
  getElement(selector, containerRef.value)?.scrollIntoView({ block: 'nearest' })
}

function isNavDisabled(index: number): boolean {
  return isNodeDisabled(rows.value[index])
}

/**
 * The active row follows the keyboard only. The pointer never sets it: the tree already
 * carries the selection highlight, so a second marker would survive the pointer leaving
 * and duplicate what `checked` already shows.
 */
const { activeIndex, dispatch, setActiveIndex } = useListNavigation({
  count: () => rows.value.length,
  isDisabled: isNavDisabled,
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

const { onKeydown } = useListKeyboardController({
  keymap: KEYMAP,
  enabled: () => !props.disabled,
  onCommand: (command) => dispatch(command),
})

/**
 * A focus indicator left on a blurred element lies about where the focus is, so the
 * active row is only painted while the tree holds it. The index itself is kept:
 * tabbing back in resumes on the row the user left from.
 */
const focused = shallowRef(false)

const activeDescendant = computed(() =>
  activeIndex.value >= 0 ? uid + '-' + activeIndex.value : undefined,
)

interface RenderEntry extends TreeFlatNode {
  start?: number
  id: string
  active: boolean
}

const renderEntries = computed<RenderEntry[]>(() => {
  const entries: RenderEntry[] = []

  for (const row of rows.value) {
    entries.push({
      ...row,
      id: uid + '-' + row.index,
      active: focused.value && activeIndex.value === row.index,
    })
  }

  if (props.virtual) {
    return virtualItems.value.flatMap((virtualItem) => {
      const entry = entries[virtualItem.index]

      return entry ? [{ ...entry, start: virtualItem.start }] : []
    })
  }

  return entries
})

const slots = useSlots()

/**
 * A row rendered with slot children carries the DYNAMIC_SLOTS patch flag, so it re-renders
 * with every tree update no matter which row changed. Without a node slot the flag stays
 * off and each row is skipped unless one of its own props moved.
 */
const hasNodeSlot = computed(
  () =>
    !!slots.node ||
    !!slots['node-switcher'] ||
    !!slots['node-icon'] ||
    !!slots['node-content'] ||
    !!slots['node-suffix'],
)

function onRowClick(value: ComponentValue): void {
  const row = getRow(value)

  if (!row) {
    return
  }

  if (!row.hasChildren || !props.expandOnClick) {
    onCheck(row)
    return
  }

  // Single selection has no checkbox, so the row is the only way to pick a parent.
  if (!props.multiple) {
    onCheck(row)
  }

  toggleNode(row)
}

function onSwitcherClick(value: ComponentValue): void {
  const row = getRow(value)

  if (row) {
    toggleNode(row)
  }
}

function onCheckboxClick(value: ComponentValue): void {
  const row = getRow(value)

  if (row) {
    onCheck(row)
  }
}

function onContainerFocus() {
  focused.value = true
}

function onContainerBlur() {
  focused.value = false
}

function onContainerKeydown(event: KeyboardEvent): void {
  const target = event.target as HTMLElement | null

  if (target?.closest('[data-tree-search]')) {
    return
  }

  onKeydown(event)
}

function scrollToKey(value: ComponentValue): void {
  const index = getRow(value)?.index

  if (index !== undefined) {
    scrollRowIntoView(index)
  }
}

function setActiveKey(value: ComponentValue): void {
  setActiveIndex(getRow(value)?.index ?? -1)
}

function getCheckedKeys(includeIndeterminate = false): ComponentValue[] {
  const result: ComponentValue[] = []

  for (const row of rows.value) {
    if (row.checked || (includeIndeterminate && row.indeterminate)) {
      result.push(row.key)
    }
  }

  return result
}

function getVisibleKeys(): ComponentValue[] {
  return rows.value.map((row) => row.key)
}

/** The source node behind a key, collapsed subtree included, so callers never lose data the tree hides. */
function getData(value: ComponentValue): TreeOption | undefined {
  return index.value.byValue.get(value)?.node
}

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
  <div
    ref="containerRef"
    role="tree"
    tabindex="0"
    class="pxd-tree m-0 p-1 scroll-p-1 w-full max-w-full overflow-auto rounded-inherit bg-background-100 outline-none"
    :style="containerStyle"
    :aria-multiselectable="multiple || undefined"
    :aria-activedescendant="focused ? activeDescendant : undefined"
    v-bind="$attrs"
    @keydown="onContainerKeydown"
    @focus="onContainerFocus"
    @blur="onContainerBlur"
  >
    <div v-if="filterable" data-tree-search class="pxd-tree--search mbe-1">
      <slot name="search">
        <PSearchInput
          :model-value="searchValue"
          :placeholder="searchPlaceholder"
          @update:model-value="onSearchInput"
        />
      </slot>
    </div>

    <div class="pxd-tree--content w-full" :class="{ relative: virtual }" :style="contentStyle">
      <div
        v-for="entry in renderEntries"
        :key="entry.key"
        class="pxd-tree--row w-full"
        :class="{ 'left-0 top-0 absolute': virtual }"
        :style="virtual ? { transform: 'translateY(' + entry.start + 'px)' } : undefined"
      >
        <PTreeNode
          v-if="!hasNodeSlot"
          :id="entry.id"
          :node="entry.node"
          :value="entry.key"
          :depth="entry.depth"
          :index="entry.index"
          :has-children="entry.hasChildren"
          :expanded="entry.expanded"
          :checked="entry.checked"
          :indeterminate="entry.indeterminate"
          :active="entry.active"
          :multiple="multiple"
          :disabled="disabled"
          :set-size="rows.length"
          :indent="indent"
          :highlight-query="highlightQuery"
          :item-class="itemClass"
          @row-click="onRowClick"
          @check="onCheckboxClick"
          @toggle="onSwitcherClick"
        />

        <PTreeNode
          v-else
          :id="entry.id"
          :node="entry.node"
          :value="entry.key"
          :depth="entry.depth"
          :index="entry.index"
          :has-children="entry.hasChildren"
          :expanded="entry.expanded"
          :checked="entry.checked"
          :indeterminate="entry.indeterminate"
          :active="entry.active"
          :multiple="multiple"
          :disabled="disabled"
          :set-size="rows.length"
          :indent="indent"
          :highlight-query="highlightQuery"
          :item-class="itemClass"
          @row-click="onRowClick"
          @check="onCheckboxClick"
          @toggle="onSwitcherClick"
        >
          <template #node="scope">
            <slot name="node" v-bind="scope" />
          </template>

          <template #node-switcher="scope">
            <slot name="node-switcher" v-bind="scope" />
          </template>

          <template #node-icon="scope">
            <slot name="node-icon" v-bind="scope" />
          </template>

          <template #node-content="scope">
            <slot name="node-content" v-bind="scope" />
          </template>

          <template #node-suffix="scope">
            <slot name="node-suffix" v-bind="scope" />
          </template>
        </PTreeNode>
      </div>
    </div>

    <div
      v-if="!rows.length"
      class="pxd-tree--empty py-7 text-sm text-center text-foreground-secondary"
    >
      <slot name="empty" />
    </div>
  </div>
</template>
