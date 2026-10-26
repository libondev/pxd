<script lang="ts" setup>
import type { ToggleButtonProps, ToggleButtonEmits } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { BASIC_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { useToggleButtonGroupContext } from '../../contexts/toggle-button.js'
import { toArray } from '../../utils/format.js'

defineOptions({
  name: 'PToggleButton',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
})

const props = withDefaults(defineProps<ToggleButtonProps>(), {
  value: true,
})

const emits = defineEmits<ToggleButtonEmits>()

const toggleButtonGroupContext = useToggleButtonGroupContext()

const isDisabled = computed(
  () => props.disabled || toggleButtonGroupContext?.props.disabled || false,
)
const computedVariant = computed(() => {
  return props.variant || toggleButtonGroupContext?.props.variant || 'default'
})

const modelValue = useModelValue(
  toggleButtonGroupContext?.props ?? props,
  toggleButtonGroupContext?.emits ?? emits,
)

const isChecked = computed(() => {
  if (toggleButtonGroupContext?.props.multiple) {
    return toArray(modelValue.value).includes(props.value)
  }

  return modelValue.value === props.value
})

const configProvider = useConfigProvider()
const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-toggle-button gap-2 font-normal relative inline-flex shrink-0 appearance-none items-center justify-center border leading-none whitespace-nowrap self-focus-ring outline-none group-data-[gap=0]/toggle-button-group:not-first:rounded-l-none group-data-[gap=0]/toggle-button-group:not-first:border-l-0 group-data-[gap=0]/toggle-button-group:not-last:rounded-r-none focus-visible:z-1 motion-safe:transition-colors',
    variants: {
      size: {
        xxs: `${BASIC_HEIGHTS.xxs} px-1 rounded-sm text-[0.625rem]`,
        xs: `${BASIC_HEIGHTS.xs} px-1.5 text-xs rounded-sm`,
        sm: `${BASIC_HEIGHTS.sm} px-2 text-sm rounded-md`,
        md: `${BASIC_HEIGHTS.md} px-2.5 text-sm rounded-md`,
        lg: `${BASIC_HEIGHTS.lg} px-3 text-base rounded-lg`,
      },
      variant: {
        default: 'border-gray-400 bg-background-100',
        ghost: 'border-transparent bg-transparent',
      },
      disabled: {
        true: 'cursor-not-allowed',
        false: 'cursor-pointer',
      },
      checked: {},
      icon: {
        true: 'aspect-square',
      },
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        class: 'border-primary bg-primary text-primary-foreground',
      },
      {
        variant: 'default',
        checked: true,
        disabled: true,
        class: 'border-gray-500 bg-gray-300',
      },
      { variant: 'ghost', checked: true, disabled: true, class: 'bg-gray-300' },
      { checked: false, disabled: false, class: 'hover:bg-background-hover' },
      { checked: false, disabled: true, class: 'bg-gray-100 text-gray-600' },
    ],
  },
  {
    selection: () => ({
      icon: props.icon,
      size: props.size || toggleButtonGroupContext?.props.size || configProvider.size,
      checked: isChecked.value,
      variant: computedVariant.value,
      disabled: isDisabled.value,
    }),
  },
)

function onToggleClick() {
  const newCheckedState = !isChecked.value

  if (toggleButtonGroupContext) {
    if (toggleButtonGroupContext.props.multiple) {
      const formattedValue = toArray(modelValue.value)

      modelValue.value = newCheckedState
        ? [...formattedValue, props.value]
        : formattedValue.filter((v) => v !== props.value)
    } else {
      modelValue.value = props.value
    }

    return
  }

  modelValue.value = newCheckedState
}
</script>

<template>
  <button
    data-toggle-button
    type="button"
    :aria-pressed="isChecked"
    :data-state="isChecked ? 'on' : 'off'"
    :data-variant="computedVariant"
    :disabled="isDisabled"
    :class="classes"
    v-bind="attrs"
    @click.stop="onToggleClick"
  >
    <slot>
      {{ label }}
    </slot>
  </button>
</template>
