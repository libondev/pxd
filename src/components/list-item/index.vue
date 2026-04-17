<script lang="ts" setup>
import type { ListItemEmits, ListItemProps } from './types'
import { tv } from 'tailwind-variants'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useListContext, useListFilterValue } from '../../contexts/list'
import { unrefElement } from '../../utils/ref'

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
  base: 'pxd-list-item h-10 gap-3 px-2 scroll-m-2 text-sm flex w-full cursor-pointer items-center rounded-md outline-none [contain-intrinsic-size:auto_2.5rem] content-visibility-auto data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700',
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

const { activeIndex, registerItem, unregisterItem, onOptionClick } = useListContext()

const filterValue = useListFilterValue()

const itemRef = shallowRef<HTMLElement>()

const itemIndex = shallowRef(-1)

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

const isDisabled = computed(() => props.disabled || props.type === 'separator')
const isSelected = computed(() => itemIndex.value !== -1 && itemIndex.value === activeIndex.value)

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

onMounted(() => {
  const el = unrefElement(itemRef.value)
  if (el) {
    registerItem(el, itemIndex)
  }
})

onBeforeUnmount(() => {
  const el = unrefElement(itemRef.value)
  if (el) {
    unregisterItem(el as HTMLElement)
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
