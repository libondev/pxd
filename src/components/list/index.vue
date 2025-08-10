<script lang="ts" setup>
import type { ListOption } from '../../types/components/list'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { provideListContext } from '../../contexts/list'
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
})

const props = withDefaults(
  defineProps<Props>(),
  {
    options: () => [],
  },
)

const emits = defineEmits<{
  close: []
  toggle: [index: number]
  selected: [ev: MouseEvent, index: number]
}>()

const ITEM_CLASS = 'pxd-list-item'
const ITEM_SELECTOR = `.${ITEM_CLASS}`

const activeIndex = shallowRef(-1)
const allItems = shallowRef<HTMLElement[]>([])

const computedStyle = computed(() => {
  return {
    width: getCssUnitValue(props.width),
  }
})

function updateAllItemsIndex() {
  allItems.value.forEach((item, index) => {
    item.dataset.index = String(index)
  })
}

function registerListItem(el: HTMLElement): void {
  if (!allItems.value.includes(el)) {
    allItems.value.push(el)
    updateAllItemsIndex()
  }
}

function unregisterListItem(el: HTMLElement): void {
  const index = allItems.value.indexOf(el)
  if (index > -1) {
    allItems.value.splice(index, 1)
    updateAllItemsIndex()
  }
}

function getItemData(index: number): ListOption | null {
  const element = allItems.value[index]

  if (!element) {
    return null
  }

  return {
    disabled: element.classList.contains('text-gray-700') || element.hasAttribute('disabled'),
    type: element.classList.contains('text-red-900') ? 'error' : undefined,
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
const THROTTLE_INTERVALS = 255

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
    emits('close')
    return
  }

  if (PREV_KEYS.includes(key)) {
    activeIndex.value = activeIndex.value === -1
      ? count - 1
      : getCorrectIndex('prev', activeIndex.value)

    emits('toggle', activeIndex.value)
  } else if (NEXT_KEYS.includes(key)) {
    activeIndex.value = activeIndex.value === -1
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
  ev.preventDefault()
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

function onOptionClick(ev: MouseEvent, index: number) {
  activeIndex.value = index
  emits('selected', ev, index)
  emits('close')
}

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
  if (isServer) {
    return
  }

  off(document, 'keydown', onContainerKeydown)

  allItems.value = []
})
</script>

<template>
  <ul
    role="list"
    tabindex="-1"
    class="pxd-list"
    :style="computedStyle"
    @pointerover="onPointerOver"
    @keydown="onContainerKeydown"
  >
    <PScrollable class="max-h-68" content-class="pr-2">
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
