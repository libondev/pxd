<script lang="ts" setup>
import type { ListProps, ListOptionSelected, ListEmits } from './types'
import { onBeforeUnmount, onMounted, shallowRef, watch } from 'vue'
import { useListNavigation } from '../../composables/use-list-navigation'
import { provideListContext, useListFilterContext } from '../../contexts/list'
import { cachedOff, cachedOn } from '../../utils/event'
import { isServer } from '../../utils/is'
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

function onOptionClick(item: ListOptionSelected, ev: MouseEvent) {
  emits('select', item, ev)
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
  activeIndex,
  registerItem,
  unregisterItem,
  onOptionClick,
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
    <slot>
      <PListItem v-for="(option, index) in options" :key="option.value ?? index" v-bind="option">
        <slot name="item" :item="option" />
      </PListItem>
    </slot>
  </ul>
</template>
