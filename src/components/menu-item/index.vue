<script lang="ts" setup>
import type { Ref } from 'vue'
import type { ComponentLabel } from '../../types/components'
import { computed, inject, onMounted, onUnmounted, shallowRef } from 'vue'

interface Props {
  type?: 'error'
  label?: ComponentLabel
  disabled?: boolean
  isFromOption?: boolean
}

defineOptions({
  name: 'PMenuItem',
})

const props = withDefaults(defineProps<Props>(), {
  disabled: false,
  isFromOption: false,
})

const activeIndex = inject<Ref<number>>('menuListActiveIndex')!
const registerOptionItem = inject<(el: HTMLElement) => void>('registerOptionItem')
const registerSlotItem = inject<(el: HTMLElement) => void>('registerSlotItem')
const unregisterItem = inject<(el: HTMLElement) => void>('unregisterMenuItem')

const itemRef = shallowRef<HTMLElement>()
const currentIndex = shallowRef(-1)

const itemClass = computed(() => {
  return {
    'bg-gray-alpha-100': activeIndex.value === currentIndex.value,
    [props.type === 'error' ? 'text-red-900' : '']: true,
    [props.disabled ? 'pointer-events-none text-gray-700' : 'cursor-pointer']: true,
  }
})

function setRef(el: any) {
  if (!el || !(el instanceof HTMLElement)) {
    return
  }

  itemRef.value = el

  // 根据来源注册到不同的列表
  if (props.isFromOption && registerOptionItem) {
    registerOptionItem(el)
  } else if (!props.isFromOption && registerSlotItem) {
    registerSlotItem(el)
  }

  // 更新当前索引
  updateCurrentIndex()
}

function updateCurrentIndex() {
  if (itemRef.value && itemRef.value.dataset.index) {
    currentIndex.value = Number(itemRef.value.dataset.index)
  }
}

onMounted(() => {
  updateCurrentIndex()

  // 监听索引变化
  const observer = new MutationObserver(() => {
    updateCurrentIndex()
  })

  if (itemRef.value) {
    observer.observe(itemRef.value, {
      attributes: true,
      attributeFilter: ['data-index'],
    })
  }

  // 清理观察器
  onUnmounted(() => {
    observer.disconnect()
  })
})

onUnmounted(() => {
  if (itemRef.value && unregisterItem) {
    unregisterItem(itemRef.value)
  }
})
</script>

<template>
  <li
    :ref="setRef"
    :data-index="currentIndex"
    :data-selected="activeIndex === currentIndex"
    class="pxd-menu-item h-10 px-2 rounded-md text-sm w-full flex items-center outline-none motion-safe:transition-colors"
    :class="itemClass"
  >
    <slot>
      {{ label }}
    </slot>
  </li>
</template>

<style>
.pxd-menu-item[data-selected="true"] {
  background-color: var(--color-gray-alpha-100);
}
</style>
