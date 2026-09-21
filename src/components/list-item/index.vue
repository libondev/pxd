<script lang="ts" setup>
import type { ListItemEmits, ListItemProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useListContext } from '../../contexts/list.js'
import { toArray } from '../../utils/format.js'
import { isNil } from '../../utils/is.js'

defineOptions({
  name: 'PListItem',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ListItemProps>(), {
  as: 'div',
  variant: 'default',
  disabled: false,
  active: false,
})

const emits = defineEmits<ListItemEmits>()

const { value: selectedValue, onItemSelect } = useListContext()

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-list-item min-h-9 p-2 gap-1.5 scroll-m-2 text-sm pe-8 flex w-full cursor-pointer items-center rounded-md outline-none [contain-intrinsic-size:auto_2.5rem] content-visibility-auto data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700',
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

const isChecked = computed(() => {
  return !isNil(props.value) && toArray(selectedValue.value).includes(props.value)
})

function onItemClick(ev: MouseEvent) {
  const value = props.value

  if (isNil(value)) {
    return
  }

  emits('click', value, ev)
  onItemSelect?.(value)
}
</script>

<template>
  <Component
    :is="as"
    tabindex="-1"
    role="option"
    data-list-item
    :data-index="index"
    :data-variant="variant"
    :data-checked="isChecked"
    :data-disabled="disabled"
    :aria-selected="active"
    :class="classes"
    v-bind="attrs"
    @click.stop="onItemClick"
  >
    <slot>
      <div class="pxd-list-item--content gap-1.5 flex flex-col">
        <span>{{ label }}</span>
        <span v-if="description" class="text-foreground-secondary">{{ description }}</span>
      </div>
    </slot>

    <CheckIcon
      v-if="isChecked"
      class="pxd-list-item--checked right-2 pointer-events-none absolute top-1/2 -translate-y-1/2 text-primary"
    />
  </Component>
</template>
