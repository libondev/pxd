<script lang="ts" setup>
import type { ListItemEmits, ListItemProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import { isNil } from 'es-toolkit'
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
  variant: 'default',
  disabled: false,
  keywords: () => [],
})

const emits = defineEmits<ListItemEmits>()

const listItemVariant = tv({
  base: 'pxd-list-item sm:min-h-10 min-h-11 py-1 gap-3 px-2 scroll-m-2 text-sm data-[checked=true]:pr-7 flex w-full cursor-pointer items-center rounded-md outline-none [contain-intrinsic-size:auto_2.5rem] content-visibility-auto data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700',
  variants: {
    variant: {
      error: 'text-red-900 active:bg-red-100 pointer-fine:aria-selected:bg-red-100',
      warning: 'text-amber-900 active:bg-amber-100 pointer-fine:aria-selected:bg-amber-100',
      default:
        'text-foreground active:bg-gray-alpha-100 pointer-fine:aria-selected:bg-gray-alpha-100',
    },
  },
})

const {
  props: listProps,
  activeIndex,
  registerItem,
  unregisterItem,
  onOptionClick,
} = useListContext()

const groupId = useListFilterGroupId(null)
const filterCtx = useListFilterContext(null)

const itemId = getUniqueId('list-item')
const itemRef = shallowRef<HTMLElement>()
const itemIndex = shallowRef(-1)

const isChecked = computed(() => {
  return !isNil(props.value) && listProps?.value === props.value
})

const isVisible = computed(() => {
  if (!filterCtx || !filterCtx.searchValue.value.trim()) {
    return true
  }

  return filterCtx.isItemVisible(itemId)
})

const isSelected = computed(() => {
  return itemIndex.value !== -1 && itemIndex.value === activeIndex.value
})

const computedClasses = computed(() => {
  return listItemVariant({ variant: props.variant })
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
    :data-variant="variant"
    :data-checked="isChecked"
    :data-disabled="disabled"
    :aria-selected="isSelected"
    :hidden="!isVisible"
    :class="computedClasses"
    v-bind="$attrs"
    @click.prevent.stop="onItemClick"
  >
    <div v-if="$slots.prefix" class="pxd-list-item--prefix">
      <slot name="prefix" />
    </div>

    <div class="pxd-list-item--content gap-1.5 flex flex-col">
      <slot>
        <span>{{ label }}</span>
        <span v-if="description" class="text-foreground-secondary">{{ description }}</span>
      </slot>
    </div>

    <CheckIcon
      v-if="isChecked"
      class="pxd-list-item--checked right-2 pointer-events-none absolute top-1/2 -translate-y-1/2"
    />
  </Component>
</template>
