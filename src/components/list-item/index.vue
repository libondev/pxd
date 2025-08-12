<script lang="ts" setup>
import type { ComponentPublicInstance } from 'vue'
import type { ComponentAs, ComponentLabel } from '../../types/shared'
import { computed, onMounted, onUnmounted, shallowRef, useAttrs } from 'vue'
import { useListContext } from '../../contexts/list'

interface Props {
  as?: ComponentAs
  type?: 'error' | 'warning'
  label?: ComponentLabel
  disabled?: boolean
  description?: ComponentLabel
}

defineOptions({
  name: 'PListItem',
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

const {
  activeIndex,
  onOptionClick,
  registerListItem,
  unregisterListItem,
} = useListContext()

const attrs = useAttrs()
const itemRef = shallowRef<HTMLElement>()
const currentIndex = shallowRef(-1)

const itemTypeMap = {
  error: 'text-red-900',
  warning: 'text-yellow-900',
}

const computedClass = computed(() => {
  const classes = [attrs.class]

  if (props.type) {
    classes.push(itemTypeMap[props.type])
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

  if (registerListItem) {
    registerListItem(itemRef.value!)
  }

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

  const observer = new MutationObserver(() => {
    updateCurrentIndex()
  })

  if (itemRef.value) {
    observer.observe(itemRef.value, {
      attributes: true,
      attributeFilter: ['data-index'],
    })
  }

  onUnmounted(() => {
    observer.disconnect()
  })
})

onUnmounted(() => {
  if (itemRef.value && unregisterListItem) {
    unregisterListItem(itemRef.value)
  }
})
</script>

<template>
  <Component
    :is="as"
    :ref="setRef"
    tabindex="-1"
    role="listitem"
    :data-index="currentIndex"
    :data-disabled="disabled"
    :data-selected="activeIndex === currentIndex"
    class="pxd-list-item h-10 gap-1 px-2 text-sm flex w-full items-center rounded-md outline-none data-[selected=true]:bg-gray-alpha-100 motion-safe:transition-colors"
    :class="computedClass"
    @click="onItemClick"
  >
    <slot>
      <span class="gap-2 flex items-center">{{ label }}</span>
      <span v-if="description" class="text-sm text-foreground-secondary">{{ description }}</span>
    </slot>
  </component>
</template>
