<script lang="ts" setup>
import type { ToggleButtonProps, ToggleButtonEmits } from './types'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { useModelValue } from '../../composables/use-model-value'
import { tv } from 'tailwind-variants'
import { useToggleButtonGroupContext } from '../../contexts/toggle-button'

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
  base: 'pxd-toggle-button relative gap-2 outline-none shrink-0 border bg-background-100 appearance-none font-medium inline-flex group-data-[gap=0]/toggle-button-group:first:rounded-r-none group-data-[gap=0]/toggle-button-group:not-first:rounded-l-none group-data-[gap=0]/toggle-button-group:not-last:rounded-r-none group-data-[gap=0]/toggle-button-group:not-first:-ml-px items-center justify-center data-[state=on]:z-1 motion-safe:transition-colors [&_svg]:pointer-events-none',
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
      false: 'hover:bg-background-hover data-[state=on]:bg-gray-300',
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

const modelValue = useModelValue(
  toggleButtonGroupContext?.props ?? props,
  toggleButtonGroupContext?.emits ?? emits,
)

const configProvider = useConfigProvider()

const computedDisabled = computed(() => props.disabled || toggleButtonGroupContext?.props.disabled)

const isChecked = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }

  if (typeof props.value === 'boolean') {
    return modelValue.value as boolean
  }

  return modelValue.value === props.value
})

const computedClass = computed(() => {
  return toggleButtonVariant({
    size: props.size || toggleButtonGroupContext?.props.size || configProvider.size,
    checked: isChecked.value,
    variant: props.variant || toggleButtonGroupContext?.props.variant,
    disabled: computedDisabled.value,
  })
})

function onToggleClick() {
  const newCheckedState = !isChecked.value

  if (Array.isArray(modelValue.value)) {
    modelValue.value = newCheckedState
      ? [...modelValue.value, props.value]
      : modelValue.value.filter((v) => v !== props.value)

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
    :disabled="computedDisabled"
    :class="computedClass"
    v-bind="$attrs"
    @click="onToggleClick"
  >
    <slot>
      {{ label }}
    </slot>
  </button>
</template>
