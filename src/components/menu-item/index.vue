<script lang="ts" setup>
import type { ComponentPublicInstance, Ref } from 'vue'
import type { ComponentAs, ComponentLabel } from '../../types/components'
import { computed, inject, onMounted, onUnmounted, shallowRef } from 'vue'

interface Props {
  as?: ComponentAs
  type?: 'error'
  label?: ComponentLabel
  disabled?: boolean
}

defineOptions({
  name: 'PMenuItem',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'li',
    disabled: false,
  },
)

type RegisterItem = (el: HTMLElement) => void

interface MenuList {
  activeIndex: Ref<number>
  registerMenuItem: RegisterItem
  unregisterMenuItem: RegisterItem
}

const {
  activeIndex,
  registerMenuItem,
  unregisterMenuItem,
} = inject<MenuList>('menuList')!

const itemRef = shallowRef<HTMLElement>()
const currentIndex = shallowRef(-1)

const itemClass = computed(() => {
  return {
    [props.type === 'error' ? 'text-red-900' : '']: true,
    [props.disabled ? 'pointer-events-none text-gray-700' : 'cursor-pointer']: true,
  }
})

function setRef(el: HTMLElement | ComponentPublicInstance) {
  if (!el) {
    return
  }

  itemRef.value = el instanceof HTMLElement ? el : el.$el!

  // 注册菜单项
  if (registerMenuItem) {
    registerMenuItem(itemRef.value!)
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
  if (itemRef.value && unregisterMenuItem) {
    unregisterMenuItem(itemRef.value)
  }
})
</script>

<template>
  <component
    :is="as"
    :ref="setRef"
    :data-index="currentIndex"
    :data-selected="activeIndex === currentIndex"
    class="pxd-menu-item h-10 px-2 rounded-md text-sm w-full flex items-center outline-none motion-safe:transition-colors"
    :class="itemClass"
  >
    <slot>
      {{ label }}
    </slot>
  </component>
</template>

<style>
.pxd-menu-item[data-selected="true"] {
  background-color: var(--color-gray-alpha-100);
}
</style>
