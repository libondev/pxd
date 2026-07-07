<script lang="ts" setup>
import type { CheckboxEmits, CheckboxProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import MinusIcon from '@gdsicon/vue/minus'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useCheckboxGroupContext } from '../../contexts/checkbox'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PCheckbox',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<CheckboxProps>(), {
  value: true,
})

const emits = defineEmits<CheckboxEmits>()

const { classes: checkboxClasses } = useTailwindVariant(
  {
    base: 'pxd-checkbox--inner size-4 p-0.5 pointer-events-none inline-flex shrink-0 transform-gpu items-center justify-center overflow-hidden border peer-focus-ring motion-safe:transition-colors',
    variants: {
      checked: {
        true: 'text-gray-100',
        false: '',
      },
      disabled: {
        true: '',
        false: '',
      },
      shape: {
        default: 'rounded-sm',
        square: 'rounded-none',
        rounded: 'rounded-full',
      },
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        class: 'border-primary bg-primary',
      },
      {
        checked: true,
        disabled: true,
        class: 'border-gray-500 bg-gray-500',
      },
      {
        checked: false,
        disabled: false,
        class: 'border-gray-alpha-400 bg-background-100 group-hover/checkbox:bg-gray-200',
      },
      {
        checked: false,
        disabled: true,
        class: 'border-gray-500 bg-gray-100',
      },
    ],
  },
  { mergeAttrsClass: false },
)

const uniqueId = getUniqueId()

const checkboxGroupContext = useCheckboxGroupContext()

const modelValue = useModelValue(
  checkboxGroupContext?.props ?? props,
  checkboxGroupContext?.emits ?? emits,
)

const isSelected = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }

  if (typeof props.value === 'boolean') {
    return modelValue.value as boolean
  }

  return modelValue.value === props.value
})

const isDisabled = computed(() => props.disabled || checkboxGroupContext?.props.disabled)

const computedClasses = computed(() => {
  return checkboxClasses({
    shape: props.shape,
    checked: isSelected.value,
    disabled: isDisabled.value,
  })
})

function onInputChange(event: Event) {
  const checked = (event.target as HTMLInputElement).checked

  if (Array.isArray(modelValue.value)) {
    modelValue.value = checked
      ? [...modelValue.value, props.value]
      : modelValue.value.filter((v) => v !== props.value)

    return
  }

  modelValue.value = checked
}
</script>

<template>
  <label
    role="checkbox"
    :aria-selected="isSelected"
    :data-disabled="isDisabled"
    class="pxd-checkbox group/checkbox gap-2 inline-flex max-w-full cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gray-500"
    :for="uniqueId"
    v-bind="$attrs"
  >
    <input
      :id="uniqueId"
      :value="value"
      type="checkbox"
      class="peer visually-hidden"
      :checked="isSelected"
      :disabled="isDisabled"
      :name="uniqueId"
      @change="onInputChange"
    />

    <span aria-hidden="true" :class="computedClasses">
      <CheckIcon v-if="isSelected" class="size-3" />
      <MinusIcon v-else-if="indeterminate" class="size-3" />
      <span v-else class="size-3" />
    </span>

    <span class="text-sm flex-1 shrink-0 leading-none empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
