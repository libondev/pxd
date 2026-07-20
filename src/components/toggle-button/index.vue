<script lang="ts" setup>
import type { ToggleButtonProps, ToggleButtonEmits } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { BASIC_HEIGHTS } from '../../constants/size'
import { useConfigProvider } from '../../contexts/config-provider'
import { useToggleButtonGroupContext } from '../../contexts/toggle-button'
import { toArray } from '../../utils/format'

defineOptions({
  name: 'PToggleButton',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ToggleButtonProps>(), {
  value: true,
})

const emits = defineEmits<ToggleButtonEmits>()

const toggleButtonGroupContext = useToggleButtonGroupContext()

const modelValue = useModelValue(
  toggleButtonGroupContext?.props ?? props,
  toggleButtonGroupContext?.emits ?? emits,
)

const configProvider = useConfigProvider()

const isDisabled = computed(
  () => props.disabled || toggleButtonGroupContext?.props.disabled || false,
)

const isChecked = computed(() => {
  if (toggleButtonGroupContext?.props.multiple) {
    return toArray(modelValue.value).includes(props.value)
  }

  return modelValue.value === props.value
})

const computedVariant = computed(() => {
  return props.variant || toggleButtonGroupContext?.props.variant || 'ghost'
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-toggle-button gap-2 font-medium relative inline-flex shrink-0 appearance-none items-center justify-center border outline-none group-data-[gap=0]/toggle-button-group:not-first:rounded-l-none group-data-[gap=0]/toggle-button-group:not-first:border-l-0 group-data-[gap=0]/toggle-button-group:not-last:rounded-r-none motion-safe:transition-colors',
    variants: {
      size: {
        xs: `${BASIC_HEIGHTS.xs} px-1.25 text-xs rounded-sm`,
        sm: `${BASIC_HEIGHTS.sm} px-1.75 text-sm rounded-md`,
        md: `${BASIC_HEIGHTS.md} px-2.5 text-sm rounded-md`,
        lg: `${BASIC_HEIGHTS.lg} px-2.75 text-base rounded-lg`,
      },
      variant: {
        outline: 'border-gray-400 bg-background-100',
        ghost: 'border-transparent bg-transparent',
      },
      disabled: {},
      checked: {},
    },
    compoundVariants: [
      { checked: true, disabled: false, class: 'bg-gray-300' },
      { checked: true, disabled: true, class: 'bg-gray-200' },
      { checked: false, disabled: true, class: 'cursor-not-allowed text-gray-400' },
      { checked: false, disabled: false, class: 'hover:bg-background-hover hover:text-gray-900' },
      { variant: 'outline', checked: true, disabled: true, class: 'bg-gray-100' },
    ],
  },
  {
    selection: () => ({
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
