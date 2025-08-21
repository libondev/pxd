<script lang="ts" setup>
import type { ListOption, ListOptionCallbackParams } from '../../types/components/list'
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
    closeOnPressEscape: true,
  },
)

const emits = defineEmits<{
  hide: []
  toggle: [index: number]
  select: ListOptionCallbackParams
}>()

const ITEM_CLASS = 'pxd-list-item'
const ITEM_SELECTOR = `.${ITEM_CLASS}`

const initialIndex = Number.NaN
const activeIndex = shallowRef(initialIndex)
const increaseIndex = shallowRef(0)
const allItems = shallowRef<HTMLElement[]>([])

const computedStyle = computed(() => {
  return {
    width: getCssUnitValue(props.width),
  }
})

function registerListItem(el: HTMLElement): void {
  if (!allItems.value.includes(el)) {
    allItems.value.push(el)
  }
}

function unregisterListItem(el: HTMLElement): void {
  const index = allItems.value.indexOf(el)
  if (index >= 0) {
    allItems.value.splice(index, 1)
  }
}

function getItemData(index: number): ListOption | null {
  const element = allItems.value[index]

  if (!element) {
    return null
  }

  const { disabled, type = 'default' } = element.dataset

  return {
    disabled: disabled === 'true',
    type: type as ListOption['type'],
  }
}

// 跳过禁用的选项后，获取正确的索引
function getCorrectIndex(dir: 'prev' | 'next', index: number): number {
  const nextIndex = dir === 'prev' ? index - 1 : index + 1
  const length = allItems.value.length

  if (nextIndex < 0) {
    return length - 1
  }

  if (nextIndex >= length) {
    return 0
  }

  const item = getItemData(nextIndex)

  if (item?.disabled) {
    return getCorrectIndex(dir, nextIndex)
  }

  return nextIndex
}

const PREV_KEYS = ['ArrowUp', 'ArrowLeft']
const NEXT_KEYS = ['ArrowDown', 'ArrowRight']
const FUNCTION_KEYS = ['Enter', 'Escape', 'Tab']
const PREVENT_DEFAULT_KEYS = [...FUNCTION_KEYS, ...PREV_KEYS, ...NEXT_KEYS]
const THROTTLE_INTERVALS = 200

const containerKeydownThrottled = throttle((ev: KeyboardEvent) => {
  const count = allItems.value.length

  if (count === 0) {
    return
  }

  const { key } = ev

  if (key === 'Tab') {
    return
  }

  if (key === 'Enter') {
    allItems.value[activeIndex.value]?.click()
    return
  }

  if (key === 'Escape' && props.closeOnPressEscape) {
    emits('hide')
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

  if (allItems.value.length <= 0 || activeIndex.value < 0) {
    return
  }

  allItems.value[activeIndex.value].scrollIntoView({
    block: 'nearest',
  })
}, THROTTLE_INTERVALS, { edges: ['leading'] })

function onContainerKeydown(ev: KeyboardEvent) {
  if (PREVENT_DEFAULT_KEYS.includes(ev.key)) {
    ev.preventDefault()
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
  ev: ListOptionCallbackParams[0],
  item: ListOptionCallbackParams[1],
  index: ListOptionCallbackParams[2],
) {
  activeIndex.value = index
  emits('select', ev, item, index)
  emits('hide')
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

  allItems.value = []
})
</script>

<template>
  <ul
    role="list"
    tabindex="-1"
    class="pxd-list max-w-full"
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
