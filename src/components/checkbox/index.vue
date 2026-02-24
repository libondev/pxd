<script lang="ts" setup>
import type { CheckboxEmits, CheckboxProps } from './types'
import CheckIcon from '@gdsicon/vue/check'
import MinusIcon from '@gdsicon/vue/minus'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useCheckboxGroupContext } from '../../contexts/checkbox'
import { getUniqueId } from '../../utils/uid'
import { tv } from 'tailwind-variants'

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

const checkboxVariant = tv({
  base: 'pxd-checkbox--inner size-4 p-0.5 inline-flex shrink-0 items-center justify-center peer-focus-ring transform-gpu overflow-hidden border motion-safe:transition-colors',
  variants: {
    checked: {
      true: '',
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
      class: 'bg-primary border-primary',
    },
    {
      checked: true,
      disabled: true,
      class: 'bg-gray-600 border-gray-600',
    },
    {
      checked: false,
      disabled: false,
      class: 'bg-background-100 border-gray-alpha-400 group-hover/checkbox:bg-gray-200',
    },
    {
      checked: false,
      disabled: true,
      class: 'bg-gray-100 border-gray-500',
    },
  ],
  defaultVariants: {
    shape: 'default',
    checked: false,
    disabled: false,
  },
})

const uniqueId = getUniqueId()

const checkboxGroupContext = useCheckboxGroupContext()

const modelValue = useModelValue(
  checkboxGroupContext?.props ?? props,
  checkboxGroupContext?.emits ?? emits,
)

const isChecked = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }

  if (typeof props.value === 'boolean') {
    return modelValue.value as boolean
  }

  return modelValue.value === props.value
})

const computedDisabled = computed(() => props.disabled || checkboxGroupContext?.props.disabled)

const computedClasses = computed(() => {
  return checkboxVariant({
    shape: props.shape,
    checked: isChecked.value,
    disabled: computedDisabled.value,
  })
})

function onInputChange(event: Event) {
  const isChecked = (event.target as HTMLInputElement).checked

  if (Array.isArray(modelValue.value)) {
    modelValue.value = isChecked
      ? [...modelValue.value, props.value]
      : modelValue.value.filter((v) => v !== props.value)

    return
  }

  modelValue.value = isChecked
}
</script>

<template>
  <label
    role="checkbox"
    :aria-checked="isChecked"
    :data-disabled="computedDisabled"
    class="pxd-checkbox group/checkbox gap-2 inline-flex max-w-full cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed"
    :class="{ 'is-disabled text-gray-500': computedDisabled }"
    :for="uniqueId"
    v-bind="$attrs"
  >
    <input
      :id="uniqueId"
      :value="value"
      type="checkbox"
      class="peer smallest"
      :checked="isChecked"
      :disabled="computedDisabled"
      @change="onInputChange"
    />

    <span aria-hidden="true" :class="computedClasses">
      <CheckIcon v-if="isChecked" class="size-3 pointer-events-none text-gray-100" />
      <MinusIcon v-else-if="indeterminate" class="size-3 pointer-events-none" />
      <span v-else class="size-3 pointer-events-none" />
    </span>

    <span class="text-sm flex-1 shrink-0 empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
