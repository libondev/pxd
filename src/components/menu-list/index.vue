<script lang="ts" setup>
import type { MenuListOption } from '../../types/components/menu'
import { computed, onBeforeUnmount, onMounted, provide, shallowRef } from 'vue'
import { off, on } from '../../utils/events'
import { throttle } from '../../utils/fn'
import { getCssUnitValue } from '../../utils/format'
import { isServer } from '../../utils/is'
import PMenuItem from '../menu-item/index.vue'
import PScrollable from '../scrollable/index.vue'

interface Props {
  width?: string | number
  options?: MenuListOption[]
}

defineOptions({
  name: 'PMenuList',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    options: () => [],
  },
)

const emits = defineEmits<{
  toggle: [index: number]
}>()

const MENU_ITEM_CLASS = 'pxd-menu-item'
const MENU_ITEM_SELECTOR = `.${MENU_ITEM_CLASS}`

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

function registerMenuItem(el: HTMLElement): void {
  if (!allItems.value.includes(el)) {
    allItems.value.push(el)
    updateAllItemsIndex()
  }
}

function unregisterMenuItem(el: HTMLElement): void {
  const index = allItems.value.indexOf(el)
  if (index > -1) {
    allItems.value.splice(index, 1)
    updateAllItemsIndex()
  }
}

// 获取项目数据
function getItemData(index: number): MenuListOption | null {
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
}, 255, { leading: true, trailing: false })

function onContainerKeydown(ev: KeyboardEvent) {
  ev.preventDefault()
  containerKeydownThrottled(ev)
}

function onPointerOver(ev: PointerEvent) {
  const target = ev.target as HTMLElement
  const menuItem = target.closest(MENU_ITEM_SELECTOR) as HTMLElement

  if (!menuItem || menuItem.dataset.index === undefined) {
    return
  }

  activeIndex.value = Number(menuItem.dataset.index)
}

provide('pxdMenuList', {
  activeIndex,
  registerMenuItem,
  unregisterMenuItem,
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
    role="menu"
    tabindex="-1"
    class="pxd-menu-list"
    :style="computedStyle"
    @pointerover="onPointerOver"
    @keydown="onContainerKeydown"
  >
    <PScrollable class="max-h-68" :fader="false" content-class="pr-2">
      <slot>
        <PMenuItem
          v-for="(option, index) in options"
          :key="option.value ?? index"
          v-bind="option"
        />
      </slot>
    </PScrollable>
  </ul>
</template>
