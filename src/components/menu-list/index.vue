<script lang="ts" setup>
import type { MenuListOption } from '../../types/components'
import { computed, onBeforeUnmount, onMounted, provide, shallowRef } from 'vue'
import { off, on } from '../../utils/events'
import { getCssUnitValue } from '../../utils/format'
import { isServer } from '../../utils/is'
import PMenuItem from '../menu-item/index.vue'

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
  optionClick: [option: MenuListOption, index: number]
}>()

const PREV_KEYS = ['ArrowUp', 'ArrowLeft']
const NEXT_KEYS = ['ArrowDown', 'ArrowRight']

const activeIndex = shallowRef(-1)
const allItems = shallowRef<HTMLElement[]>([])
const optionElements = shallowRef<HTMLElement[]>([])
const slotElements = shallowRef<HTMLElement[]>([])

const computedStyle = computed(() => {
  return {
    width: getCssUnitValue(props.width),
  }
})

// 获取总项目数量
const totalItemsCount = computed(() => {
  return allItems.value.length
})

// 更新所有项目的索引
function updateAllItemsIndex() {
  allItems.value.forEach((item, index) => {
    item.dataset.index = String(index)
  })
}

// 注册来自 options 的 MenuItem
function registerOptionItem(el: HTMLElement): void {
  if (!optionElements.value.includes(el)) {
    optionElements.value.push(el)
    rebuildAllItems()
  }
}

// 注册来自插槽的 MenuItem
function registerSlotItem(el: HTMLElement): void {
  if (!slotElements.value.includes(el)) {
    slotElements.value.push(el)
    rebuildAllItems()
  }
}

// 取消注册 MenuItem
function unregisterMenuItem(el: HTMLElement): void {
  const optionIndex = optionElements.value.indexOf(el)
  const slotIndex = slotElements.value.indexOf(el)

  if (optionIndex > -1) {
    optionElements.value.splice(optionIndex, 1)
  }
  if (slotIndex > -1) {
    slotElements.value.splice(slotIndex, 1)
  }

  rebuildAllItems()
}

// 重建全部项目列表并更新索引
function rebuildAllItems() {
  allItems.value = [...optionElements.value, ...slotElements.value]
  updateAllItemsIndex()
}

// 获取项目数据
function getItemData(index: number): MenuListOption | null {
  const element = allItems.value[index]
  if (!element) {
    return null
  }

  // 如果是来自 options 的项目
  const optionIndex = optionElements.value.indexOf(element)
  if (optionIndex > -1) {
    return props.options[optionIndex]
  }

  // 如果是来自插槽的项目，从 DOM 中提取信息
  return {
    disabled: element.classList.contains('text-gray-700') || element.hasAttribute('disabled'),
    type: element.classList.contains('text-red-900') ? 'error' : undefined,
  }
}

// 跳过禁用的选项后，获取正确的索引
function getCorrectIndex(dir: 'prev' | 'next', index: number): number {
  const nextIndex = dir === 'prev' ? index - 1 : index + 1

  if (nextIndex < 0) {
    return totalItemsCount.value - 1
  }

  if (nextIndex >= totalItemsCount.value) {
    return 0
  }

  const item = getItemData(nextIndex)
  if (item?.disabled) {
    return getCorrectIndex(dir, nextIndex)
  }

  return nextIndex
}

function onOptionsClick(option: MenuListOption, index: number) {
  if (option.disabled) {
    return
  }

  emits('optionClick', option, index)

  if (typeof option.onClick === 'function') {
    option.onClick(option)
  }
}

function onContainerKeydown(ev: KeyboardEvent) {
  const count = totalItemsCount.value
  if (count === 0) {
    return
  }

  if (PREV_KEYS.includes(ev.key)) {
    ev.preventDefault()
    activeIndex.value = activeIndex.value === -1
      ? count - 1
      : getCorrectIndex('prev', activeIndex.value)
  } else if (NEXT_KEYS.includes(ev.key)) {
    ev.preventDefault()
    activeIndex.value = activeIndex.value === -1
      ? 0
      : getCorrectIndex('next', activeIndex.value)
  } else if (ev.key === 'Enter') {
    ev.preventDefault()

    if (activeIndex.value >= 0) {
      const item = getItemData(activeIndex.value)
      if (item) {
        onOptionsClick(item, activeIndex.value)
      }
    }
  }
}

function onPointerOver(ev: PointerEvent) {
  const target = ev.target as HTMLElement
  const menuItem = target.closest('li.pxd-menu-item') as HTMLElement

  if (!menuItem || menuItem.dataset.index === undefined) {
    return
  }

  activeIndex.value = Number(menuItem.dataset.index)
}

function onContainerClick(ev: MouseEvent) {
  const target = ev.target as HTMLElement
  let menuItem: HTMLElement | null = null

  if (target.tagName === 'LI' && target.classList.contains('pxd-menu-item')) {
    menuItem = target
  } else {
    menuItem = target.closest('li.pxd-menu-item') as HTMLElement
  }

  if (!menuItem || menuItem.dataset.index === undefined) {
    return
  }

  const index = Number(menuItem.dataset.index)
  const item = getItemData(index)

  if (item) {
    onOptionsClick(item, index)
  }
}

// 提供注入
provide('menuListActiveIndex', activeIndex)
provide('registerOptionItem', registerOptionItem)
provide('registerSlotItem', registerSlotItem)
provide('unregisterMenuItem', unregisterMenuItem)

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

  // 清理所有引用
  allItems.value = []
  optionElements.value = []
  slotElements.value = []
})
</script>

<template>
  <ul
    class="pxd-menu-list shadow-border-menu bg-background rounded-xl p-2 list-none outline-none"
    :style="computedStyle"
    @pointerover="onPointerOver"
    @click="onContainerClick"
  >
    <slot>
      <PMenuItem
        v-for="(option, index) in options"
        :key="option.value ?? index"
        :type="option.type"
        :label="option.label"
        :disabled="option.disabled"
        :is-from-option="true"
      />
    </slot>
  </ul>
</template>
