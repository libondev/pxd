<script lang="ts" setup>
import type { ListOption, ListOptionCallbackParams, SelectedListOption } from '../../types/components/list'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { provideListContext, provideListItemIndexContext } from '../../contexts/list'
import { off, on } from '../../utils/events'
import { getCssUnitValue } from '../../utils/format'
import { isServer } from '../../utils/is'
import { throttle } from '../../utils/throttle'
import PListItem from '../list-item/index.vue'
import PScrollable from '../scrollable/index.vue'

interface Props {
  width?: string | number
  options?: ListOption[]
  keyListener?: boolean
  itemTransition?: boolean
  closeOnPressEscape?: boolean
}

defineOptions({
  name: 'PList',
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<Props>(),
  {
    options: () => [],
    keyListener: true,
    itemTransition: true,
    closeOnPressEscape: false,
  },
)

const emits = defineEmits<{
  escape: []
  toggle: [index: number]
  select: ListOptionCallbackParams
}>()

interface CollectionOptionItem {
  el: HTMLElement
  data: ListOption
}

const ITEM_CLASS = 'pxd-list-item'
const ITEM_SELECTOR = `.${ITEM_CLASS}`

const initialIndex = Number.NaN
const increaseIndex = shallowRef(0)
const activeIndex = shallowRef(initialIndex)

const allItemsMap = new Map<number, CollectionOptionItem>()

const computedStyle = computed(() => {
  return {
    width: getCssUnitValue(props.width),
  }
})

function registerListItem(index: number, el: HTMLElement, data: ListOption): void {
  allItemsMap.set(index, { el, data })
}

function unregisterListItem(index: number): void {
  allItemsMap.delete(index)
}

// 跳过禁用的选项后，获取正确的索引
function getCorrectIndex(dir: 'prev' | 'next', index: number): number {
  const nextIndex = dir === 'prev' ? index - 1 : index + 1
  const length = allItemsMap.size

  if (nextIndex < 0) {
    return length - 1
  }

  if (nextIndex >= length) {
    return 0
  }

  const item = allItemsMap.get(nextIndex)

  if (item?.data.disabled) {
    return getCorrectIndex(dir, nextIndex)
  }

  return nextIndex
}

const PREV_KEYS = ['ArrowUp', 'ArrowLeft']
const NEXT_KEYS = ['ArrowDown', 'ArrowRight']
const FUNCTION_KEYS = ['Enter', 'Escape', 'Tab']
const PREVENT_DEFAULT_KEYS = [...FUNCTION_KEYS, ...PREV_KEYS, ...NEXT_KEYS]
const THROTTLE_INTERVALS = 100

const containerKeydownThrottled = throttle((ev: KeyboardEvent) => {
  if (!props.keyListener) {
    return
  }

  const count = allItemsMap.size

  if (count === 0) {
    return
  }

  const { key } = ev

  if (key === 'Tab') {
    return
  }

  if (key === 'Enter') {
    allItemsMap.get(activeIndex.value)?.el.click()
    return
  }

  if (key === 'Escape' && props.closeOnPressEscape) {
    emits('escape')
    return
  }

  if (PREV_KEYS.includes(key)) {
    activeIndex.value = Object.is(activeIndex.value, initialIndex)
      ? count - 1
      : getCorrectIndex('prev', activeIndex.value)

    emits('toggle', activeIndex.value)
  } else if (NEXT_KEYS.includes(key)) {
    activeIndex.value = Object.is(activeIndex.value, initialIndex)
      ? 0
      : getCorrectIndex('next', activeIndex.value)

    emits('toggle', activeIndex.value)
  }
  // TODO: support [Home] and [End] keydown

  if (allItemsMap.size <= 0 || activeIndex.value < 0) {
    return
  }

  allItemsMap.get(activeIndex.value)?.el.scrollIntoView({
    block: 'nearest',
  })
}, THROTTLE_INTERVALS, { edges: ['leading'] })

function onContainerKeydown(ev: KeyboardEvent) {
  if (PREVENT_DEFAULT_KEYS.includes(ev.key)) {
    ev.preventDefault()
    ev.stopPropagation()
  }

  ev.stopPropagation()
  containerKeydownThrottled(ev)
}

function onPointerOver(ev: PointerEvent) {
  const target = ev.target as HTMLElement
  const listItem = target.closest(ITEM_SELECTOR) as HTMLElement

  if (!listItem || listItem.dataset.index === undefined) {
    return
  }

  activeIndex.value = Number(listItem.dataset.index)
}

function onOptionClick(
  ev: MouseEvent,
  item: SelectedListOption,
  index: number,
) {
  const { as, onClick, ...option } = item

  activeIndex.value = index
  emits('select', ev, option, index)
}

provideListItemIndexContext(increaseIndex)
provideListContext({
  activeIndex,
  onOptionClick,
  registerListItem,
  unregisterListItem,
})

onMounted(() => {
  if (isServer) {
    return
  }

  on(document, 'keydown', onContainerKeydown)
})

onBeforeUnmount(() => {
  off(document, 'keydown', onContainerKeydown)

  allItemsMap.clear()
})
</script>

<template>
  <ul
    role="list"
    tabindex="-1"
    :data-transition="itemTransition"
    class="pxd-list group/list max-w-full"
    :style="computedStyle"
    v-bind="$attrs"
    @pointerover="onPointerOver"
  >
    <PScrollable class="max-h-68 p-2 rounded-inherit" fader-direction="vertical">
      <slot>
        <PListItem
          v-for="(option, index) in options"
          :key="option.value ?? index"
          v-bind="option"
        />
      </slot>
    </PScrollable>
  </ul>
</template>
