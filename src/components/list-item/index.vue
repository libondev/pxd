<script lang="ts" setup>
import type { ListItemEmits, ListItemProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import ChevronRightIcon from '@gdsicon/vue/chevron-right'
import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant.js'
import {
  provideListFilterParentItemId,
  useListContext,
  useListFilterContext,
  useListFilterGroupId,
  useListFilterParentItemId,
} from '../../contexts/list.js'
import { getElement } from '../../utils/dom.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'

defineOptions({
  name: 'PListItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ListItemProps>(), {
  as: 'li',
  variant: 'default',
  disabled: false,
  hasChildren: false,
  keywords: () => [],
})

const emits = defineEmits<ListItemEmits>()

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-list-item min-h-10 sm:min-h-9 p-2 gap-1.5 scroll-m-2 text-sm pe-8 flex w-full cursor-pointer items-center rounded-md outline-none [contain-intrinsic-size:auto_2.5rem] content-visibility-auto data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700',
    variants: {
      variant: {
        error: 'text-red-900 active:bg-red-100 pointer-fine:aria-selected:bg-red-100',
        warning: 'text-amber-900 active:bg-amber-100 pointer-fine:aria-selected:bg-amber-100',
        default:
          'text-foreground active:bg-gray-alpha-100 pointer-fine:aria-selected:bg-gray-alpha-100',
      },
    },
  },
  {
    selection: () => ({ variant: props.variant }),
  },
)

const {
  props: listProps,
  activeIndex,
  registerItem,
  unregisterItem,
  onItemSelect,
} = useListContext()

const groupId = useListFilterGroupId(null)
const filterCtx = useListFilterContext(null)
const parentItemId = useListFilterParentItemId(null)

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

function getValue(): string {
  return `${String(props.label ?? '')}${String(props.description ?? '')}`.trim()
}

function getKeywords(): string[] {
  return props.keywords
}

function onItemClick(ev: MouseEvent) {
  const value = props.value

  if (isNil(value)) {
    return
  }

  emits('click', value, ev)
  onItemSelect?.(value, ev)
}

onMounted(() => {
  const el = getElement(itemRef.value)
  if (el) {
    registerItem(el, itemIndex)
  }

  filterCtx?.registerItem(itemId, {
    groupId,
    parentItemId,
    getValue,
    getKeywords,
  })
})

onBeforeUnmount(() => {
  const el = getElement(itemRef.value)
  if (el) {
    unregisterItem(el as HTMLElement)
  }

  filterCtx?.unregisterItem(itemId)
})

provideListFilterParentItemId(itemId)
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
    :data-has-children="hasChildren"
    :data-disabled="disabled"
    :aria-selected="isSelected"
    :hidden="!isVisible"
    :class="classes"
    v-bind="attrs"
    @click.prevent.stop="onItemClick"
  >
    <slot>
      <div class="pxd-list-item--content gap-1.5 flex flex-col">
        <span>{{ label }}</span>
        <span v-if="description" class="text-foreground-secondary">{{ description }}</span>
      </div>
    </slot>

    <slot v-if="isSelected" name="children" />

    <ChevronRightIcon
      v-if="hasChildren"
      class="size-4 ms-auto shrink-0 text-foreground-secondary"
    />

    <CheckIcon
      v-if="isChecked"
      class="pxd-list-item--checked pointer-events-none absolute top-1/2 -translate-y-1/2"
      :class="hasChildren ? 'right-7' : 'right-2'"
    />
  </Component>
</template>
