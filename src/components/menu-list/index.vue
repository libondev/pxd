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
  optionClick: [option: MenuListOption]
}>()

const PREV_KEYS = ['ArrowUp', 'ArrowLeft']
const NEXT_KEYS = ['ArrowDown', 'ArrowRight']

const activeIndex = shallowRef(-1)

const computedStyle = computed(() => {
  return {
    width: getCssUnitValue(props.width),
  }
})

// 跳过禁用的选项后，获取正确的索引
function getCorrectIndex(dir: 'prev' | 'next', index: number) {
  const nextIndex = dir === 'prev' ? index - 1 : index + 1
  const nextOption = props.options[nextIndex]

  if (nextOption?.disabled) {
    return getCorrectIndex(dir, nextIndex)
  }

  if (nextIndex < 0 || nextIndex >= props.options.length) {
    return index
  }

  if (nextIndex < 0) {
    return 0
  }

  if (nextIndex >= props.options.length) {
    return props.options.length - 1
  }

  return nextIndex
}

function onOptionsClick(option: MenuListOption) {
  if (option.disabled) {
    return
  }

  emits('optionClick', option)

  if (typeof option.onClick !== 'function') {
    return
  }

  option.onClick(option)
}

function onContainerKeydown(ev: KeyboardEvent) {
  if (PREV_KEYS.includes(ev.key)) {
    ev.preventDefault()

    activeIndex.value = getCorrectIndex('prev', activeIndex.value)
  } else if (NEXT_KEYS.includes(ev.key)) {
    ev.preventDefault()

    activeIndex.value = getCorrectIndex('next', activeIndex.value)
  } else if (ev.key === 'Enter') {
    ev.preventDefault()

    onOptionsClick(props.options[activeIndex.value])
  }
}

function onPointerOver(ev: PointerEvent) {
  const target = ev.target as HTMLElement

  if (target.tagName !== 'LI' || target.dataset.index === undefined) {
    return
  }

  activeIndex.value = Number(target.dataset.index)
}

function onContainerClick(ev: MouseEvent) {
  let target = ev.target as HTMLElement
  let index = -1

  if (target.tagName === 'LI') {
    index = Number(target.dataset.index)
  } else {
    target = target.closest('li.pxd-menu-item') as HTMLElement
    index = Number(target?.dataset.index) ?? -1
  }

  if (!target || index === -1) {
    return
  }

  const option = props.options[index]

  onOptionsClick(option)
}

provide('menuListActiveIndex', activeIndex)

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
})
</script>

<template>
  <ul
    class="pxd-menu-list shadow-border-menu bg-background rounded-xl p-2 list-none outline-none"
    :style="computedStyle"
    @pointerover="onPointerOver"
    @click="onContainerClick"
  >
    <PMenuItem
      v-for="(option, index) in options"
      :key="option.value ?? index"
      :index="index"
      :option="option"
    />
  </ul>
</template>
