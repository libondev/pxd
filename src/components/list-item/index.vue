<script lang="ts" setup>
import type { ListOption, ListOptionSelected } from '../../types/components/list'
import { computed, shallowRef } from 'vue'
import { useListContext } from '../../contexts/list'
import { getUniqueId } from '../../utils/uid'

interface Props {
  as?: ListOption['as']
  type?: ListOption['type']
  label?: ListOption['label']
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
  click: [MouseEvent, ListOptionSelected]
}>()

const {
  activeValue,
  onOptionClick,
} = useListContext()

const currentValue = String(props.label) || getUniqueId()

const itemRef = shallowRef<HTMLElement>()

const itemTypeMap = {
  error: 'text-red-900 pointer-coarse:active:bg-red-100 pointer-fine:data-[selected=true]:bg-red-100',
  warning: 'text-amber-900 pointer-coarse:active:bg-amber-100 pointer-fine:data-[selected=true]:bg-amber-100',
  default: 'text-foreground pointer-coarse:active:bg-gray-alpha-100 pointer-fine:data-[selected=true]:bg-gray-alpha-100',
  separator: '!h-0 !w-auto px-0 m-1.5 border-b',
}

const isSelected = computed(() => activeValue.value === currentValue)
const isDisabled = computed(() => props.disabled || props.type === 'separator')

const computedClass = computed(() => {
  const { type = 'default' } = props
  const classes = ['pxd-list-item h-10 gap-2 px-2 text-sm flex w-full cursor-pointer items-center rounded-md outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700 group-data-[transition=true]/list:motion-safe:transition-colors']

  if (type in itemTypeMap) {
    classes.push(itemTypeMap[type])
  }

  return classes.join(' ')
})

function onItemClick(ev: MouseEvent) {
  emits('click', ev, props)
  onOptionClick?.(ev, props)
}
</script>

<template>
  <Component
    :is="as"
    ref="itemRef"
    tabindex="-1"
    role="listitem"
    :data-type="type"
    :data-value="currentValue"
    :data-selected="isSelected"
    :data-disabled="isDisabled"
    :class="computedClass"
    @click.prevent.stop="onItemClick"
  >
    <slot v-if="type !== 'separator'">
      <span class="gap-2 flex items-center">{{ label }}</span>
      <span v-if="description" class="text-sm text-foreground-secondary">{{ description }}</span>
    </slot>
  </component>
</template>
