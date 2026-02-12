<script lang="ts" setup>
import type { ToggleButtonProps, ToggleButtonEmits } from './types'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { useModelValue } from '../../composables/use-model-value'
import { tv } from 'tailwind-variants'
import {
  useToggleButtonGroupContext,
  useToggleButtonGroupModelValue,
} from '../../contexts/toggle-button'

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

const toggleButtonVariant = tv({
  base: 'pxd-toggle-button gap-2 outline-none shrink-0 border bg-background-100 appearance-none font-medium inline-flex group-data-[gap=0]/toggle-button-group:first:rounded-r-none group-data-[gap=0]/toggle-button-group:not-first:rounded-l-none group-data-[gap=0]/toggle-button-group:not-last:rounded-r-none group-data-[gap=0]/toggle-button-group:not-first:border-l-transparent items-center justify-center motion-safe:transition-colors [&_svg]:pointer-events-none',
  variants: {
    size: {
      sm: 'h-7.5 px-2 text-sm rounded-md',
      md: 'h-9 px-2.75 text-sm rounded-md',
      lg: 'h-10 px-3 text-base rounded-lg',
    },
    variant: {
      ghost: 'border-transparent',
      outline: 'border-input',
    },
    disabled: {
      true: 'cursor-not-allowed',
      false: 'hover:bg-background-hover data-[state=on]:bg-background-active',
    },
    checked: {
      true: '',
      false: '',
    },
  },
  compoundVariants: [
    { checked: true, disabled: true, class: 'bg-gray-200' },
    { checked: false, disabled: true, class: 'text-gray-400' },
    { variant: 'outline', checked: false, disabled: true, class: 'border-gray-400' },
    { variant: 'outline', checked: true, disabled: true, class: 'bg-gray-100 border-gray-500' },
  ],
  defaultVariants: {
    size: 'md',
    variant: 'ghost',
    checked: false,
    disabled: false,
  },
})

const toggleButtonGroupContext = useToggleButtonGroupContext()
const toggleButtonGroupModelValue = useToggleButtonGroupModelValue()

const modelValue = useModelValue(props, emits)

const configProvider = useConfigProvider()

const computedVariant = computed(() => props.variant || toggleButtonGroupContext?.variant)
const computedDisabled = computed(() => props.disabled || toggleButtonGroupContext?.disabled)

const computedClass = computed(() => {
  return toggleButtonVariant({
    size: props.size || configProvider.size,
    checked: isChecked.value,
    variant: computedVariant.value,
    disabled: computedDisabled.value,
  })
})

const isChecked = computed(() => {
  if (toggleButtonGroupModelValue) {
    if (Array.isArray(toggleButtonGroupModelValue.value)) {
      return toggleButtonGroupModelValue.value.includes(props.value)
    }

    return toggleButtonGroupModelValue.value === props.value
  }

  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }

  if (typeof props.value === 'boolean') {
    return modelValue.value as boolean
  }

  return modelValue.value === props.value
})

function onToggleClick() {
  const _modelValue = toggleButtonGroupModelValue || modelValue
  const newCheckedState = !isChecked.value

  if (Array.isArray(_modelValue.value)) {
    _modelValue.value = newCheckedState
      ? [..._modelValue.value, props.value]
      : _modelValue.value.filter((v) => v !== props.value)

    return
  }

  _modelValue.value = newCheckedState
}
</script>

<template>
  <button
    type="button"
    :aria-pressed="isChecked"
    :data-state="isChecked ? 'on' : 'off'"
    :disabled="computedDisabled"
    :class="computedClass"
    @click="onToggleClick"
    v-bind="$attrs"
  >
    <slot>
      {{ label }}
    </slot>
  </button>
</template>
