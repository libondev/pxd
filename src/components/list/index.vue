<script lang="ts" setup>
import type { ListNavigationCommand } from '../../composables/_internal/use-list-navigation.js'
import type { ListItemRow, ListRow } from '../../composables/_internal/use-list-rows'
import type { ListProps, ListOption, ListOptionSelected, ListEmits } from './types'
import { computed, nextTick, onMounted, shallowRef, watch } from 'vue'
import { useListNavigation } from '../../composables/_internal/use-list-navigation.js'
import { flattenListOptions } from '../../composables/_internal/use-list-rows.js'
import { resolveNextListValue } from '../../composables/_internal/use-list-selection.js'
import { resolveOptionByValue } from '../../composables/_internal/use-selected-list-item.js'
import { useVirtualList } from '../../composables/use-virtual-list.js'
import { provideListContext } from '../../contexts/list.js'
import { getElement } from '../../utils/dom.js'
import { toArray } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'
import PListGroup from '../list-group/index.vue'
import PListItem from '../list-item/index.vue'
import PLoadingMask from '../loading-mask/index.vue'

interface RenderEntry {
  key: string | number
  index?: number
  start?: number
  row?: ListRow
  itemRow?: ListItemRow
}

defineOptions({
  name: 'PList',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
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

const uid = getUniqueId('list-item')

const containerRef = shallowRef<HTMLElement>()

const flattened = computed(() => flattenListOptions(props.options))
const rows = computed(() => flattened.value.rows)
const itemRows = computed(() => flattened.value.itemRows)

const { activeIndex, dispatch, setActiveIndex, onPointerOver, setFirstAsActive } =
  useListNavigation({
    loop: () => props.loop,
    count: () => itemRows.value.length,
    defaultActiveIndex: () => props.defaultActiveIndex,
    isDisabled: isNavDisabled,
    onActivateItem,
    scrollToIndex: scrollNavIndexIntoView,
  })

// Stable ids so host comboboxes can point aria-activedescendant at the active row.
const activeItemId = computed(() =>
  activeIndex.value >= 0 ? `${uid}-${activeIndex.value}` : undefined,
)

const { totalSize, virtualItems, measureElement, scrollToIndex } = useVirtualList(containerRef, {
  dataKey: 'key',
  enabled: () => props.virtual,
  scrollPaddingStart: props.itemSize,
  scrollPaddingEnd: props.itemSize,
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

const renderEntries = computed<RenderEntry[]>(() => {
  if (props.virtual) {
    return virtualItems.value.map((virtualItem) => {
      const row = rows.value[virtualItem.index]
      return {
        key: virtualItem.key,
        index: virtualItem.index,
        start: virtualItem.start,
        row,
        itemRow: row?.type === 'item' ? row : undefined,
      }
    })
  }

  return rows.value.map((row) => ({
    key: row.key,
    row,
    itemRow: row.type === 'item' ? row : undefined,
  }))
})

function isNavDisabled(index: number): boolean {
  return itemRows.value[index]?.option.disabled === true
}
function scrollNavIndexIntoView(navIndex: number) {
  const row = itemRows.value[navIndex]
  if (!row) {
    return
  }

  if (props.virtual) {
    scrollToIndex(row.rowIndex, { align: 'auto', behavior: 'instant' })
    return
  }

  findItemElement(navIndex)?.scrollIntoView({
    block: 'nearest',
    behavior: 'instant',
  })
}

function toSelectedOption(option: ListOption): ListOptionSelected {
  const { as, icon, ...selectedOption } = option

  return selectedOption
}

function onItemSelect(value: ListOptionSelected['value']): void {
  if (props.loading) {
    return
  }

  const option = resolveOptionByValue(props.options, value)

  if (!option || option.disabled) {
    return
  }

  const nextValue = resolveNextListValue(props.modelValue, value, props.multiple)

  emits('update:model-value', nextValue)
  emits('change', toSelectedOption(option))
}

function onActivateItem(navIndex: number) {
  const el = findItemElement(navIndex)

  if (el) {
    el.click()
    return
  }

  const row = itemRows.value[navIndex]
  if (!row) {
    return
  }

  onItemSelect(row.option.value)
}
function dispatchCommand(command: ListNavigationCommand): boolean {
  if (props.loading) {
    return false
  }

  return dispatch(command)
}
function findItemElement(navIndex: number): HTMLElement | null {
  return getElement(`[data-list-item][data-index="${navIndex}"]`, containerRef.value)
}

function syncActiveItem(next: number, previous: number): void {
  if (previous >= 0) {
    findItemElement(previous)?.removeAttribute('data-active')
  }

  if (next >= 0) {
    findItemElement(next)?.setAttribute('data-active', 'true')
  }
}

function refreshActiveItem(): void {
  const container = containerRef.value
  if (!container) {
    return
  }

  container.querySelectorAll<HTMLElement>('[data-list-item][data-active]').forEach((el) => {
    el.removeAttribute('data-active')
  })

  if (activeIndex.value >= 0) {
    findItemElement(activeIndex.value)?.setAttribute('data-active', 'true')
  }
}
function scrollToFirstSelected(): boolean {
  const firstValue = toArray(props.modelValue)[0]

  if (isNil(firstValue)) {
    return false
  }

  const target = itemRows.value.find((row) => row.option.value === firstValue)

  if (!target) {
    return false
  }

  if (props.virtual) {
    nextTick(() => scrollNavIndexIntoView(target.navIndex))
    return true
  }

  const container = containerRef.value
  const item = findItemElement(target.navIndex)

  if (!container || !item) {
    return false
  }

  const itemRect = item.getBoundingClientRect()
  const containerRect = container.getBoundingClientRect()

  if (itemRect.top < containerRect.top) {
    // Keep one row between the selection and the top edge.
    container.scrollTop -= containerRect.top - itemRect.top + itemRect.height
  } else if (itemRect.bottom > containerRect.bottom) {
    // Keep one row between the selection and the bottom edge.
    container.scrollTop += itemRect.bottom - containerRect.bottom + itemRect.height
  }

  return true
}

function scrollToFirstOption(): void {
  if (props.virtual) {
    if (rows.value.length > 0) {
      scrollToIndex(0, { align: 'start', behavior: 'instant' })
    }
    return
  }

  if (containerRef.value) {
    containerRef.value.scrollTop = 0
  }
}

function restoreScroll(): void {
  if (!scrollToFirstSelected()) {
    scrollToFirstOption()
  }
}

watch(() => activeIndex.value, syncActiveItem, { flush: 'post' })
watch(() => renderEntries.value, refreshActiveItem, { flush: 'post' })
watch(
  () => rows.value,
  async () => {
    await nextTick()
    restoreScroll()
  },
  { flush: 'post' },
)

provideListContext({
  value: computed(() => props.modelValue),
  onItemSelect,
})

onMounted(() => {
  refreshActiveItem()
  restoreScroll()
})

defineExpose({
  focus: () => containerRef.value?.focus(),
  dispatch: dispatchCommand,
  setActiveIndex,
  setFirstAsActive,
  activeIndex,
  activeItemId,
})
</script>

<template>
  <div
    ref="containerRef"
    role="listbox"
    tabindex="-1"
    data-list
    :aria-busy="loading"
    :aria-multiselectable="multiple"
    class="pxd-list m-0 p-2 scroll-p-2 relative max-w-full list-none overflow-auto rounded-inherit bg-background-100 outline-none empty:hidden"
    :class="{ 'min-h-22': loading && !rows.length }"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <div
      role="presentation"
      class="pxd-list--content w-full"
      :class="{ relative: virtual }"
      :style="virtual ? { height: `${totalSize}px` } : undefined"
    >
      <div
        v-for="entry in renderEntries"
        :key="entry.key"
        :ref="virtual ? measureElement : undefined"
        :data-index="entry.index"
        role="presentation"
        class="pxd-list--row w-full"
        :class="{ 'left-0 top-0 absolute': virtual }"
        :style="virtual ? { transform: `translateY(${entry.start}px)` } : undefined"
      >
        <PListGroup v-if="entry.row?.type === 'header'" :label="entry.row.label" />

        <PListItem
          v-else-if="entry.itemRow"
          v-bind="entry.itemRow.option"
          :id="`${uid}-${entry.itemRow.navIndex}`"
          :index="entry.itemRow.navIndex"
          :class="itemClass"
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

    <PLoadingMask v-if="loading" />
    <p
      v-else-if="!rows.length"
      role="presentation"
      class="pxd-list--empty py-6.5 m-0 text-sm text-center text-foreground-secondary empty:hidden"
    >
      <slot name="empty" />
    </p>
  </div>
</template>
