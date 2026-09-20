<script lang="ts" setup>
import type { ListProps, ListOption, ListOptionSelected, ListEmits } from './types'
import { computed, shallowRef, watch } from 'vue'
import { useListNavigation } from '../../composables/_internal/use-list-navigation.js'
import {
  isListOptionGroup,
  resolveOptionByValue,
} from '../../composables/_internal/use-selected-list-item.js'
import { provideListContext, useListFilterContext } from '../../contexts/list.js'
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
})

const emits = defineEmits<ListEmits>()

const containerRef = shallowRef<HTMLElement>()

const {
  dispatch,
  setActiveIndex,
  registerItem,
  unregisterItem,
  onPointerOver,
  refreshItems,
  setFirstAsActive,
} = useListNavigation(containerRef, {
  loop: () => props.loop,
  itemSelector: `[data-list-item]:not([data-disabled="true"],[hidden])`,
  defaultActiveIndex: () => props.defaultActiveIndex,
  itemFilter: (item) => !item.closest('[hidden]'),
  onToggle: (currentIndex) => emits('toggle', currentIndex),
})

const filterCtx = useListFilterContext(null)

if (filterCtx) {
  watch(
    () => filterCtx.searchValue.value.trim(),
    async () => {
      await refreshItems()
      setFirstAsActive()
    },
  )
}

function toSelectedOption(option: ListOption): ListOptionSelected {
  const { as, keywords, ...selectedOption } = option

  return selectedOption
}

const renderOptions = computed(() => {
  return props.options.map((entry, index) => ({
    entry,
    index,
    key: isListOptionGroup(entry) ? `group-${entry.label ?? index}` : String(entry.value),
  }))
})

function onItemSelect(value: ListOptionSelected['value'], ev: MouseEvent): void {
  const option = resolveOptionByValue(props.options, value)

  if (!option) {
    return
  }

  emits('change', toSelectedOption(option), ev)
}

provideListContext({
  value: computed(() => props.value),
  registerItem,
  unregisterItem,
  onItemSelect,
})

defineExpose({
  focus: () => containerRef.value?.focus(),
  dispatch,
  refreshItems,
  setActiveIndex,
  setFirstAsActive,
})
</script>

<template>
  <ul
    ref="containerRef"
    role="listbox"
    tabindex="-1"
    data-list
    :aria-multiselectable="multiple"
    class="pxd-list m-0 p-2 max-w-full list-none overflow-auto rounded-inherit bg-background-100 outline-none empty:hidden"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <template v-for="option in renderOptions" :key="option.key">
      <PListGroup v-if="isListOptionGroup(option.entry)" :label="option.entry.label">
        <PListItem v-for="(item, itemIndex) in option.entry.options" :key="itemIndex" v-bind="item">
          <template v-if="$slots.item">
            <slot
              name="item"
              :item="item"
              :index="itemIndex"
              :group="option.entry"
              :group-index="option.index"
            />
          </template>
        </PListItem>
      </PListGroup>

      <PListItem v-else v-bind="option.entry">
        <template v-if="$slots.item">
          <slot name="item" :item="option.entry" :index="option.index" />
        </template>
      </PListItem>
    </template>

    <p v-if="empty" role="presentation" class="py-7 text-sm text-center text-foreground-secondary">
      <slot name="empty" />
    </p>
  </ul>
</template>
