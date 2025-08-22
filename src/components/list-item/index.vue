<script lang="ts" setup>
import type { ListOption, ListOptionCallbackParams } from '../../types/components/list'
import { computed, onMounted, onUnmounted, shallowRef, useAttrs } from 'vue'
import { useListContext } from '../../contexts/list'
import { unrefElement } from '../../utils/ref'

interface Props {
  as?: ListOption['as']
  type?: ListOption['type']
  label?: ListOption['label']
  value?: ListOption['value']
  disabled?: ListOption['disabled']
  description?: ListOption['description']
}

defineOptions({
  name: 'PListItem',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    as: 'li',
    type: 'default',
    disabled: false,
  },
)

const emits = defineEmits<{
  click: ListOptionCallbackParams
}>()

const {
  activeIndex,
  increaseIndex,
  onOptionClick,
  registerListItem,
  unregisterListItem,
} = useListContext()

const currentIndex = increaseIndex.value++

const attrs = useAttrs()
const itemRef = shallowRef<HTMLElement>()

const itemTypeMap = {
  error: 'text-red-900 data-[selected=true]:bg-red-100',
  warning: 'text-amber-900 data-[selected=true]:bg-amber-100',
  default: 'text-foreground data-[selected=true]:bg-gray-alpha-100',
  separator: '!h-0 !w-auto px-0 m-1.5 border-b',
}

const isSelected = computed(() => activeIndex.value === currentIndex)

const computedClass = computed(() => {
  const { type = 'default' } = props
  const classes = ['cursor-pointer data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700', attrs.class]

  if (type in itemTypeMap) {
    classes.push(itemTypeMap[type])
  }

  return classes.join(' ')
})

const computedDisabled = computed(() => props.disabled || props.type === 'separator')

function onItemClick(ev: MouseEvent) {
  const index = currentIndex

  emits('click', ev, props, index)
  onOptionClick?.(ev, props, index)
}

onMounted(() => {
  if (!registerListItem) {
    return
  }

  registerListItem(currentIndex, unrefElement(itemRef)!, props)
})

onUnmounted(() => {
  if (!unregisterListItem) {
    return
  }

  unregisterListItem(currentIndex)
})
</script>

<template>
  <Component
    :is="as"
    ref="itemRef"
    tabindex="-1"
    role="listitem"
    :data-type="type"
    :data-index="currentIndex"
    :data-selected="isSelected"
    :data-disabled="computedDisabled"
    class="pxd-list-item h-10 gap-1 px-2 text-sm flex w-full items-center rounded-md outline-none group-data-[transition=true]/list:motion-safe:transition-colors"
    :class="computedClass"
    @click.prevent.stop="onItemClick"
  >
    <slot v-if="type !== 'separator'">
      <span class="gap-2 flex items-center">{{ label }}</span>
      <span v-if="description" class="text-sm text-foreground-secondary">{{ description }}</span>
    </slot>
  </component>
</template>
