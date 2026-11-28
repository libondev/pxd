<script lang="ts" setup>
import type { ChangeAt } from '../../types/shared/change'
import type { ToggleButtonChangeReason, ToggleButtonProps, ToggleButtonEmits } from './types'
import { computed } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { BASIC_HEIGHTS, SIZE_TEXT_CLASS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { useToggleButtonGroupContext } from '../../contexts/toggle-button.js'
import { toArray } from '../../utils/format.js'

defineOptions({
  name: 'PToggleButton',
  inheritAttrs: false,
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

const { modelValue, change } = useModelValue(
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
        xxs: `${BASIC_HEIGHTS.xxs} px-1 rounded-sm ${SIZE_TEXT_CLASS.xxs}`,
        xs: `${BASIC_HEIGHTS.xs} px-1.5 rounded-sm ${SIZE_TEXT_CLASS.xs}`,
        sm: `${BASIC_HEIGHTS.sm} px-2 rounded-md ${SIZE_TEXT_CLASS.sm}`,
        md: `${BASIC_HEIGHTS.md} px-2.5 rounded-md ${SIZE_TEXT_CLASS.md}`,
        lg: `${BASIC_HEIGHTS.lg} px-3 rounded-lg ${SIZE_TEXT_CLASS.lg}`,
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
      iconOnly: {
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
      iconOnly: props.iconOnly,
      size: props.size || toggleButtonGroupContext?.props.size || configProvider.size,
      checked: isChecked.value,
      variant: computedVariant.value,
      disabled: isDisabled.value,
    }),
  },
)

// A group that renders its choices from `options` reports them once; one whose buttons are
// written by hand leaves each button to report itself.
if (!toggleButtonGroupContext?.props.options?.length) {
  useAgentNode({
    name: 'toggle-button',
    state: () => ({
      value: modelValue.value,
      checked: isChecked.value,
      disabled: isDisabled.value,
    }),
    actions: {
      setValue: (value) => {
        applyChecked(Boolean(value), { reason: 'api' })
      },
      toggle: () => {
        applyChecked(!isChecked.value, { reason: 'api' })
      },
    },
  })
}

function applyChecked(checked: boolean, at: ChangeAt<ToggleButtonChangeReason>) {
  const context = toggleButtonGroupContext

  if (!context) {
    change(checked, at)

    return
  }

  if (context.props.multiple) {
    const values = toArray(modelValue.value)

    change(checked ? [...values, props.value] : values.filter((value) => value !== props.value), at)

    return
  }

  change(props.value, at)
}

function onToggleClick() {
  applyChecked(!isChecked.value, { reason: 'item-press' })
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
