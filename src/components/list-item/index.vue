<script lang="ts" setup>
import { computed, shallowRef } from 'vue'
import { useListContext, useListFilterValue } from '../../contexts/list'
import { unrefElement } from '../../utils/ref'
import { getUniqueId } from '../../utils/uid'
import { tv } from 'tailwind-variants'
import type { ListItemEmits, ListItemProps } from './types'

defineOptions({
  name: 'PListItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ListItemProps>(), {
  as: 'li',
  type: 'default',
  disabled: false,
  keywords: () => [],
})

const emits = defineEmits<ListItemEmits>()

const listItemVariant = tv({
  base: 'pxd-list-item h-10 gap-3 px-2 text-sm flex w-full cursor-pointer items-center rounded-md outline-none [contain-intrinsic-size:auto_2.5rem] content-visibility-auto data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700 group-data-[transition=true]/list:motion-safe:transition-colors',
  variants: {
    type: {
      error:
        'text-red-900 pointer-coarse:active:bg-red-100 pointer-fine:data-[selected=true]:bg-red-100',
      warning:
        'text-amber-900 pointer-coarse:active:bg-amber-100 pointer-fine:data-[selected=true]:bg-amber-100',
      default:
        'text-foreground pointer-coarse:active:bg-gray-alpha-100 pointer-fine:data-[selected=true]:bg-gray-alpha-100',
      separator: 'h-0! px-0 m-1.5 w-auto! border-b',
    },
  },
  defaultVariants: {
    type: 'default',
  },
})

const { activeValue, onOptionClick } = useListContext()

const uniqueId = getUniqueId()
const filterValue = useListFilterValue()

const itemRef = shallowRef<HTMLElement>()

const searchableText = computed(() => {
  const keywordsText =
    props.keywords.length > 0 ? props.keywords.join('').toLowerCase().replace(/\s/g, '') : ''

  if (props.label) {
    const propsText = `${String(props.label || '')}${props.description || ''}`
      .toLowerCase()
      .replace(/\s/g, '')

    return propsText + keywordsText
  }

  if (keywordsText) {
    return keywordsText
  }

  return getCachedTextContent()
})

const isVisible = computed(() =>
  filterValue?.value ? searchableText.value.includes(filterValue.value.toLowerCase()) : true,
)
const isSelected = computed(() => activeValue.value === uniqueId)
const isDisabled = computed(() => props.disabled || props.type === 'separator')

const computedClasses = computed(() => {
  return listItemVariant({ type: props.type })
})

let cachedTextContent = ''

function getCachedTextContent() {
  const text = unrefElement(itemRef.value)?.textContent || ''

  if (text) {
    cachedTextContent = text.toLowerCase().replace(/\s/g, '')
  }

  return cachedTextContent
}

function onItemClick(ev: MouseEvent) {
  const { as, keywords, ...restProps } = props

  emits('click', restProps, ev)
  onOptionClick?.(restProps, ev)
}
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
    v-bind="$attrs"
    @click.prevent.stop="onItemClick"
  >
    <slot v-if="type !== 'separator'">
      <span>{{ label }}</span>
      <span v-if="description" class="text-foreground-secondary">{{ description }}</span>
    </slot>
  </Component>
</template>
