<script lang="ts" setup>
import type {
  ListProps,
  ListOption,
  ListOptionEntry,
  ListOptionGroup,
  ListOptionSelected,
  ListEmits,
} from './types'
import { computed, onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useListNavigation } from '../../composables/use-list-navigation'
import { provideListContext, useListFilterContext } from '../../contexts/list'
import { cachedOff, cachedOn } from '../../utils/event'
import { isServer } from '../../utils/is'
import PListGroup from '../list-group/index.vue'
import PListItem from '../list-item/index.vue'

defineOptions({
  name: 'PList',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ListProps>(), {
  loop: true,
  options: () => [],
  toggleOnKeyPress: true,
  defaultActiveIndex: -1,
})

const emits = defineEmits<ListEmits>()

const containerRef = shallowRef<HTMLElement>()

function isListOptionGroup(option: ListOptionEntry): option is ListOptionGroup {
  return option.type === 'group'
}

function resolveOptionByValue(value: ListOptionSelected['value']): ListOption | undefined {
  for (const entry of props.options) {
    if (isListOptionGroup(entry)) {
      const matchedOption = entry.options.find((option) => option.value === value)

      if (matchedOption) {
        return matchedOption
      }

      continue
    }

    if (entry.value === value) {
      return entry
    }
  }
}

function toSelectedOption(option: ListOption): ListOptionSelected {
  const { as, keywords, onClick, ...selectedOption } = option

  return selectedOption
}

function toListItemProps(option: ListOption): Record<string, any> {
  const { onClick, ...itemProps } = option

  return itemProps
}

const renderOptions = computed(() => {
  return props.options.map((entry, index) => ({
    entry,
    index,
    key: isListOptionGroup(entry) ? `group-${index}-${entry.label ?? ''}` : String(entry.value),
  }))
})

function onItemSelect(value: ListOptionSelected['value'], ev: MouseEvent) {
  const option = resolveOptionByValue(value)

  if (option) {
    option.onClick?.(toSelectedOption(option), ev)
    emits('select', toSelectedOption(option), ev)
  }
}

const {
  activeIndex,
  isEmpty,
  onKeydown,
  setActiveIndex,
  registerItem,
  unregisterItem,
  onPointerOver,
  refreshItems,
  setFirstAsActive,
} = useListNavigation(containerRef, {
  loop: props.loop,
  itemSelector: `[data-list-item]:not([data-disabled="true"],[hidden])`,
  toggleOnKeyPress: props.toggleOnKeyPress,
  defaultActiveIndex: props.defaultActiveIndex,
  onToggle: () => emits('toggle'),
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

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      cachedOff(document, 'keydown', onKeydown)
      cachedOn(document, 'keydown', onKeydown)
    } else {
      setActiveIndex(-1)
      cachedOff(document, 'keydown', onKeydown)
    }
  },
)

provideListContext({
  props,
  activeIndex,
  registerItem,
  unregisterItem,
  onItemSelect,
})

onMounted(async () => {
  if (isServer()) {
    return
  }

  cachedOn(document, 'keydown', onKeydown)
})

onBeforeUnmount(() => {
  cachedOff(document, 'keydown', onKeydown)
})

defineExpose({
  isEmpty,
  refreshItems,
  setActiveIndex,
  setFirstAsActive,
})
</script>

<template>
  <ul
    ref="containerRef"
    role="list"
    tabindex="-1"
    class="pxd-list m-0 p-2 max-w-full list-none overflow-auto bg-background-100 outline-none"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <template v-for="option in renderOptions" :key="option.key">
      <PListGroup v-if="isListOptionGroup(option.entry)" :label="option.entry.label">
        <template v-if="$slots.group" #label>
          <slot name="group" :group="option.entry" :index="option.index" />
        </template>

        <PListItem
          v-for="(item, itemIndex) in option.entry.options"
          :key="itemIndex"
          v-bind="toListItemProps(item)"
        >
          <slot
            name="item"
            :item="item"
            :index="itemIndex"
            :group="option.entry"
            :group-index="option.index"
          />
        </PListItem>
      </PListGroup>

      <PListItem v-else v-bind="toListItemProps(option.entry)">
        <slot name="item" :item="option.entry" :index="option.index" />
      </PListItem>
    </template>

    <p
      v-if="empty"
      role="presentation"
      class="py-7.5 text-sm text-center text-foreground-secondary"
    >
      <slot name="empty" />
    </p>
  </ul>
</template>
