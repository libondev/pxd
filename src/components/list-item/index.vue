<script lang="ts" setup>
import type { ListOption, ListOptionSelected } from '../../types/components/list'
import { computed, nextTick, onMounted, shallowRef } from 'vue'
import { useListContext, useListFilterValue } from '../../contexts/list'
import { unrefElement } from '../../utils/ref'
import { getUniqueId } from '../../utils/uid'
import { listItemVariant } from './cn'

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

const props = withDefaults(defineProps<Props>(), {
  as: 'li',
  type: 'default',
  disabled: false,
})

const emits = defineEmits<{
  click: [ListOptionSelected, MouseEvent]
}>()

const { activeValue, onOptionClick } = useListContext()

const uniqueId = getUniqueId()
const filterValue = useListFilterValue()

const itemRef = shallowRef<HTMLElement>()
const currentValue = shallowRef('')

const isVisible = computed(() =>
  filterValue?.value ? currentValue.value.includes(filterValue.value.toLowerCase()) : true,
)
const isSelected = computed(() => activeValue.value === uniqueId)
const isDisabled = computed(() => props.disabled || props.type === 'separator')

const computedClasses = computed(() => {
  return listItemVariant({ type: props.type })
})

function onItemClick(ev: MouseEvent) {
  emits('click', props, ev)
  onOptionClick?.(props, ev)
}

onMounted(async () => {
  await nextTick()

  if (props.label) {
    currentValue.value = `${String(props.label || '')}${props.description || ''}`
      .toLowerCase()
      .replace(/\s/g, '')
  } else {
    currentValue.value = (unrefElement(itemRef.value)?.textContent || '')
      .toLowerCase()
      .replace(/\s/g, '')
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
    :class="computedClasses"
    @click.prevent.stop="onItemClick"
  >
    <slot v-if="type !== 'separator'">
      <span>{{ label }}</span>
      <span v-if="description" class="text-foreground-secondary">{{ description }}</span>
    </slot>
  </Component>
</template>
