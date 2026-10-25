<script lang="ts" setup>
import type { ListItemEmits, ListItemProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { BASIC_MIN_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
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

const NATIVE_DISABLED_TAGS = new Set([
  'button',
  'input',
  'select',
  'textarea',
  'option',
  'optgroup',
  'fieldset',
])

const nativeDisabled = computed(() => {
  if (!props.disabled || typeof props.as !== 'string') {
    return undefined
  }

  return NATIVE_DISABLED_TAGS.has(props.as.toLowerCase()) ? true : undefined
})

const { value: selectedValue, onItemSelect } = useListContext()

const isChecked = computed(() => {
  return !isNil(props.value) && toArray(selectedValue.value).includes(props.value)
})

const configProvider = useConfigProvider()
const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-list-item p-2 text-sm pe-40 gap-2 flex w-full max-w-full cursor-pointer items-center rounded-md outline-none content-visibility-auto data-[disabled=true]:pointer-events-none data-[disabled=true]:text-gray-700',
    variants: {
      size: {
        sm: BASIC_MIN_HEIGHTS.sm,
        md: BASIC_MIN_HEIGHTS.md,
        lg: BASIC_MIN_HEIGHTS.lg,
      },
      variant: {
        error: 'text-red-900 active:bg-red-100 pointer-fine:data-[active=true]:bg-red-100',
        warning: 'text-amber-900 active:bg-amber-100 pointer-fine:data-[active=true]:bg-amber-100',
        default:
          'text-foreground active:bg-gray-alpha-100 pointer-fine:data-[active=true]:bg-gray-alpha-100',
      },
    },
  },
  {
    selection: () => ({ size: configProvider.size, variant: props.variant }),
  },
)

function onItemClick(ev: MouseEvent) {
  const value = props.value

  if (props.disabled || isNil(value)) {
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
    :data-active="active"
    :aria-selected="isChecked"
    :aria-disabled="disabled"
    :disabled="nativeDisabled"
    :class="classes"
    v-bind="attrs"
    @click.stop="onItemClick"
  >
    <slot>
      <div class="pxd-list-item--content">
        <span>{{ label }}</span>
        <div v-if="description" class="mbs-0.5 text-foreground-secondary">{{ description }}</div>
      </div>
    </slot>

    <CheckIcon
      v-if="isChecked"
      class="pxd-list-item--checked right-3 absolute top-1/2 -translate-y-1/2 text-primary"
    />
  </Component>
</template>
