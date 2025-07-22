<script lang="ts" setup>
import type { ComponentPublicInstance, Ref } from 'vue'
import type { ComponentAs, ComponentLabel } from '../../types/shared'
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

const emits = defineEmits<{
  click: [ev: MouseEvent, index: number]
}>()

type RegisterItem = (el: HTMLElement) => void

interface MenuListProvider {
  activeIndex: Ref<number>
  registerMenuItem: RegisterItem
  unregisterMenuItem: RegisterItem
}

interface MenuProvider {
  onOptionClick: (ev: MouseEvent, index: number) => void
}

const {
  onOptionClick,
} = inject<MenuProvider>('pxdMenu')!

const {
  activeIndex,
  registerMenuItem,
  unregisterMenuItem,
} = inject<MenuListProvider>('pxdMenuList')!

const itemRef = shallowRef<HTMLElement>()
const currentIndex = shallowRef(-1)

const computedClass = computed(() => {
  const classes = []

  if (props.type === 'error') {
    classes.push('text-red-900')
  }

  if (props.disabled) {
    classes.push('pointer-events-none text-gray-700')
  } else {
    classes.push('cursor-pointer')
  }

  return classes.join(' ')
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

function onItemClick(ev: MouseEvent) {
  emits('click', ev, currentIndex.value)
  onOptionClick?.(ev, currentIndex.value)
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
    tabindex="-1"
    role="menuitem"
    :data-index="currentIndex"
    :data-disabled="disabled"
    :data-selected="activeIndex === currentIndex"
    class="pxd-menu-item h-10 px-2 rounded-md text-sm w-full flex items-center outline-none motion-safe:transition-colors"
    :class="computedClass"
    @click="onItemClick"
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
