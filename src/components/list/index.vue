<script lang="ts" setup>
import type { ListItemRow, ListHeaderRow, ListRow } from '../../composables/_internal/use-list-rows'
import type { ListProps, ListOption, ListOptionSelected, ListEmits } from './types'
import { computed, reactive, shallowRef } from 'vue'
import { useListNavigation } from '../../composables/_internal/use-list-navigation.js'
import {
  flattenListOptions,
  resolveNavigableOption,
  resolveRowIndexByNavIndex,
} from '../../composables/_internal/use-list-rows.js'
import { resolveOptionByValue } from '../../composables/_internal/use-selected-list-item.js'
import { useVirtualList } from '../../composables/use-virtual-list.js'
import { provideListContext } from '../../contexts/list.js'
import { getElement } from '../../utils/dom.js'
import PListGroup from '../list-group/index.vue'
import PListItem from '../list-item/index.vue'

defineOptions({
  name: 'PList',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ListProps>(), {
  loop: true,
  options: () => [],
  defaultActiveIndex: -1,
  virtual: false,
  itemSize: 36,
  overScan: 4,
})

const emits = defineEmits<ListEmits>()

const containerRef = shallowRef<HTMLElement>()

const flattened = computed(() => flattenListOptions(props.options))
const rows = computed(() => flattened.value.rows)
const navigableCount = computed(() => flattened.value.navigableCount)

function isNavDisabled(index: number): boolean {
  return resolveNavigableOption(rows.value, index)?.option.disabled === true
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

/**
 * Non-virtual keeps DOM `scrollIntoView`: group headers are not `itemSize`, so
 * arithmetic/`scrollToIndex` would drift. Virtual path uses the virtualizer.
 */
function scrollNavIndexIntoView(navIndex: number) {
  const rowIndex = resolveRowIndexByNavIndex(rows.value, navIndex)
  if (rowIndex < 0) {
    return
  }

  if (props.virtual) {
    scrollToIndex(rowIndex, { align: 'auto' })
    return
  }

  const el = getElement(`[data-list-item][data-index="${navIndex}"]`, containerRef.value)
  el?.scrollIntoView({ block: 'nearest' })
}

function toSelectedOption(option: ListOption): ListOptionSelected {
  const { as, keywords, ...selectedOption } = option

  return selectedOption
}

function onItemSelect(value: ListOptionSelected['value']): void {
  const option = resolveOptionByValue(props.options, value)

  if (!option) {
    return
  }

  emits('change', toSelectedOption(option))
}

function onActivateItem(navIndex: number) {
  const el = getElement(`[data-list-item][data-index="${navIndex}"]`, containerRef.value)

  if (el) {
    el.click()
    return
  }

  const row = resolveNavigableOption(rows.value, navIndex)
  if (!row) {
    return
  }

  onItemSelect(row.option.value)
}

const { activeIndex, dispatch, setActiveIndex, onPointerOver, setFirstAsActive } =
  useListNavigation({
    loop: () => props.loop,
    count: () => navigableCount.value,
    defaultActiveIndex: () => props.defaultActiveIndex,
    isDisabled: isNavDisabled,
    onActivateItem,
    scrollToIndex: scrollNavIndexIntoView,
  })

function isItemActive(row: ListItemRow): boolean {
  return activeIndex.value === row.navIndex
}

interface RenderEntry {
  key: string | number
  start?: number
  row?: ListRow
  itemRow?: ListItemRow
  headerLabel?: ListHeaderRow['label']
}

const renderEntries = computed<RenderEntry[]>(() => {
  if (props.virtual) {
    return virtualItems.value.map((virtualItem) => {
      const row = rows.value[virtualItem.index]
      return {
        key: virtualItem.key,
        start: virtualItem.start,
        row,
        itemRow: row?.type === 'item' ? row : undefined,
        headerLabel: row?.type === 'header' ? row.label : undefined,
      }
    })
  }

  return rows.value.map((row) => ({
    key: row.key,
    row,
    itemRow: row.type === 'item' ? row : undefined,
    headerLabel: row.type === 'header' ? row.label : undefined,
  }))
})

const contentStyle = computed(() => {
  if (!props.virtual) {
    return undefined
  }

  return {
    height: `${totalSize.value}px`,
  }
})

provideListContext({
  value: computed(() => props.value),
  onItemSelect,
})

defineExpose({
  focus: () => containerRef.value?.focus(),
  dispatch,
  setActiveIndex,
  setFirstAsActive,
  activeIndex,
})
</script>

<template>
  <div
    ref="containerRef"
    role="listbox"
    tabindex="-1"
    data-list
    :aria-multiselectable="multiple"
    class="pxd-list m-0 p-2 max-w-full list-none overflow-auto rounded-inherit bg-background-100 outline-none empty:hidden"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <div
      role="presentation"
      class="pxd-list--content w-full"
      :class="{ relative: virtual }"
      :style="contentStyle"
    >
      <div
        v-for="entry in renderEntries"
        :key="entry.key"
        role="presentation"
        class="pxd-list--row w-full"
        :class="{ 'left-0 top-0 absolute': virtual }"
        :style="virtual ? { transform: `translateY(${entry.start}px)` } : undefined"
      >
        <PListGroup v-if="entry.row?.type === 'header'" :label="entry.headerLabel" />

        <PListItem
          v-else-if="entry.itemRow"
          v-bind="entry.itemRow.option"
          :index="entry.itemRow.navIndex"
          :active="isItemActive(entry.itemRow)"
        >
          <template v-if="$slots.item">
            <slot
              name="item"
              :item="entry.itemRow.option"
              :index="entry.itemRow.itemIndex"
              :group="entry.itemRow.group"
              :group-index="entry.itemRow.groupIndex"
            />
          </template>
        </PListItem>
      </div>
    </div>

    <p v-if="empty" role="presentation" class="py-7 text-sm text-center text-foreground-secondary">
      <slot name="empty" />
    </p>
  </div>
</template>
