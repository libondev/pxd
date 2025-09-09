<script lang="ts" setup>
import type { ListOption, ListOptionSelected } from '../../types/components/list'
import { computed, nextTick, onMounted, shallowRef } from 'vue'
import { useListContext, useListFilterValue } from '../../contexts/list'
import { unrefElement } from '../../utils/ref'
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

const uniqueId = getUniqueId()
const filterValue = useListFilterValue()

const itemRef = shallowRef<HTMLElement>()
const currentValue = shallowRef('')

const itemTypeMap = {
  error: 'text-red-900 pointer-coarse:active:bg-red-100 pointer-fine:data-[selected=true]:bg-red-100',
  warning: 'text-amber-900 pointer-coarse:active:bg-amber-100 pointer-fine:data-[selected=true]:bg-amber-100',
  default: 'text-foreground pointer-coarse:active:bg-gray-alpha-100 pointer-fine:data-[selected=true]:bg-gray-alpha-100',
  separator: '!h-0 !w-auto px-0 m-1.5 border-b',
}

const isVisible = computed(() => filterValue?.value ? currentValue.value.includes(filterValue.value.toLowerCase()) : true)
const isSelected = computed(() => activeValue.value === uniqueId)
const isDisabled = computed(() => props.disabled || props.type === 'separator')

const computedClass = computed(() => {
  const { type = 'default' } = props
  const classes = ['pxd-list-item h-10 gap-3 px-2 text-sm flex w-full cursor-pointer items-center rounded-md outline-none data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700 group-data-[transition=true]/list:motion-safe:transition-colors']

  if (type in itemTypeMap) {
    classes.push(itemTypeMap[type])
  }

  return classes.join(' ')
})

function onItemClick(ev: MouseEvent) {
  emits('click', ev, props)
  onOptionClick?.(ev, props)
}

onMounted(async () => {
  await nextTick()

  if (props.label) {
    currentValue.value = `${String(props.label || '')}${(props.description || '')}`.toLowerCase().replace(/\s/g, '')
  } else {
    currentValue.value = (unrefElement(itemRef.value)?.textContent || '').toLowerCase().replace(/\s/g, '')
  }
})
</script>

<template>
  <Component
    :is="as"
    v-if="isVisible"
    ref="itemRef"
    tabindex="-1"
    role="listitem"
    :data-type="type"
    :data-value="uniqueId"
    :data-selected="isSelected"
    :data-disabled="isDisabled"
    :class="computedClass"
    @click.prevent.stop="onItemClick"
  >
    <slot v-if="type !== 'separator'">
      <span>{{ label }}</span>
      <span v-if="description" class="text-foreground-secondary">{{ description }}</span>
    </slot>
  </component>
</template>
