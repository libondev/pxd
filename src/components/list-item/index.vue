<script lang="ts" setup>
import type { ListOption, ListOptionCallbackParams } from '../../types/components/list'
import { computed, onMounted, onUnmounted, shallowRef, useAttrs } from 'vue'
import { useListContext, useListItemIndexContext } from '../../contexts/list'

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
  onOptionClick,
  registerListItem,
  unregisterListItem,
} = useListContext()

const listItemIndex = useListItemIndexContext()

const attrs = useAttrs()
const itemRef = shallowRef<HTMLElement>()
const currentIndex = shallowRef(listItemIndex.value++)

const itemTypeMap = {
  error: 'text-red-900 data-[selected=true]:bg-red-100',
  warning: 'text-amber-900 data-[selected=true]:bg-amber-100',
  default: 'text-foreground data-[selected=true]:bg-gray-alpha-100',
}

const isSelected = computed(() => activeIndex.value === currentIndex.value)

const computedClass = computed(() => {
  const classes = ['cursor-pointer data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700', attrs.class]

  if (props.type) {
    classes.push(itemTypeMap[props.type])
  }

  return classes.join(' ')
})

function onItemClick(ev: MouseEvent) {
  const { as, ...option } = props
  const index = currentIndex.value

  emits('click', ev, option, index)
  onOptionClick?.(ev, option, index)
}

onMounted(() => {
  if (registerListItem) {
    registerListItem(itemRef.value!)
  }
})

onUnmounted(() => {
  if (unregisterListItem) {
    unregisterListItem(itemRef.value!)
  }
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
    :data-disabled="disabled"
    :data-selected="isSelected"
    class="pxd-list-item h-10 gap-1 px-2 text-sm flex w-full items-center rounded-md outline-none motion-safe:transition-colors"
    :class="computedClass"
    @click="onItemClick"
  >
    <slot>
      <span class="gap-2 flex items-center">{{ label }}</span>
      <span v-if="description" class="text-sm text-foreground-secondary">{{ description }}</span>
    </slot>
  </component>
</template>
