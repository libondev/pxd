<script lang="ts" setup>
import type { ListItemEmits, ListItemProps } from './types'
import { tv } from 'tailwind-variants'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useListContext, useListFilterContext, useListFilterGroupId } from '../../contexts/list'
import { unrefElement } from '../../utils/ref'
import { getUniqueId } from '../../utils/uid'

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
  base: 'pxd-list-item sm:h-10 h-12 gap-3 px-2 scroll-m-2 text-sm flex w-full cursor-pointer items-center rounded-md outline-none [contain-intrinsic-size:auto_2.5rem] content-visibility-auto data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700',
  variants: {
    type: {
      error: 'text-red-900 active:bg-red-100 pointer-fine:aria-selected:bg-red-100',
      warning: 'text-amber-900 active:bg-amber-100 pointer-fine:aria-selected:bg-amber-100',
      default:
        'text-foreground active:bg-gray-alpha-100 pointer-fine:aria-selected:bg-gray-alpha-100',
    },
  },
})

const { activeIndex, registerItem, unregisterItem, onOptionClick } = useListContext()

const groupId = useListFilterGroupId(null)
const filterCtx = useListFilterContext(null)

const itemId = getUniqueId('list-item')
const itemRef = shallowRef<HTMLElement>()
const itemIndex = shallowRef(-1)

const isVisible = computed(() => {
  if (!filterCtx || !filterCtx.searchValue.value.trim()) {
    return true
  }

  return filterCtx.isItemVisible(itemId)
})

const isSelected = computed(() => itemIndex.value !== -1 && itemIndex.value === activeIndex.value)

const computedClasses = computed(() => {
  return listItemVariant({ type: props.type })
})

function getValue(): string {
  return `${String(props.label ?? '')}${String(props.description ?? '')}`.trim()
}

function getKeywords(): string[] {
  return props.keywords
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

  filterCtx?.registerItem(itemId, {
    groupId,
    getValue,
    getKeywords,
  })
})

onBeforeUnmount(() => {
  const el = unrefElement(itemRef.value)
  if (el) {
    unregisterItem(el as HTMLElement)
  }

  filterCtx?.unregisterItem(itemId)
})
</script>

<template>
  <Component
    :is="as"
    ref="itemRef"
    tabindex="-1"
    role="listitem"
    data-list-item
    :data-type="type"
    :data-disabled="disabled"
    :aria-selected="isSelected"
    :hidden="!isVisible"
    :class="computedClasses"
    v-bind="$attrs"
    @click.prevent.stop="onItemClick"
  >
    <slot>
      <span>{{ label }}</span>
      <span v-if="description" class="text-foreground-secondary">{{ description }}</span>
    </slot>
  </Component>
</template>
