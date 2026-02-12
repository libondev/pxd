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
  modelValue: () => [],
  value: true,
})

const emits = defineEmits<CheckboxEmits>()

const checkboxVariant = tv({
  slots: {
    wrapper:
      'pxd-checkbox group/checkbox gap-2 inline-flex max-w-full cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed',
    inner:
      'pxd-checkbox--inner size-4 inline-flex shrink-0 transform-gpu items-center justify-center overflow-hidden rounded-sm border peer-focus-ring motion-safe:transition-colors',
  },
  variants: {
    checked: {
      true: {
        inner: 'border-primary bg-primary',
      },
      false: {
        inner: 'border-gray-alpha-400 bg-background-100 group-hover/checkbox:bg-gray-200',
      },
    },
    disabled: {
      true: {
        wrapper: 'is-disabled text-gray-500',
        inner: '',
      },
      false: {
        wrapper: '',
        inner: '',
      },
    },
  },
  compoundVariants: [
    { checked: true, disabled: true, inner: 'border-gray-600 bg-gray-600' },
    { checked: false, disabled: true, inner: 'border-gray-500 bg-gray-100' },
  ],
})

const uniqueId = getUniqueId()
const modelValue = useModelValue(props, emits)

const checkboxGroupContext = useCheckboxGroupContext()

const isChecked = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }

  if (typeof props.value === 'boolean') {
    return modelValue.value as boolean
  }

  return modelValue.value === props.value
})

const computedDisabled = computed(() => props.disabled || checkboxGroupContext?.disabled)
const computedRequired = computed(() => props.required || checkboxGroupContext?.required)

const computedClasses = computed(() => {
  return checkboxVariant({
    checked: isChecked.value,
    disabled: computedDisabled.value,
  })
})

function toggleChecked(isChecked: boolean) {
  if (Array.isArray(modelValue.value)) {
    modelValue.value = isChecked
      ? [...modelValue.value, props.value]
      : modelValue.value.filter((v) => v !== props.value)

    return
  }

  modelValue.value = isChecked
}

function onInputChange(event: Event) {
  const isInputChecked = (event.target as HTMLInputElement).checked

  toggleChecked(isInputChecked)
}

function getCheckedState() {
  if (props.indeterminate) {
    return 'indeterminate'
  }

  return isChecked.value ? 'checked' : 'unchecked'
}

defineExpose({
  getCheckedState,
})
</script>

<template>
  <label
    role="checkbox"
    :aria-checked="isChecked"
    :data-disabled="computedDisabled"
    :class="computedClasses.wrapper()"
    :for="uniqueId"
    v-bind="$attrs"
  >
    <input
      :id="uniqueId"
      :value="value"
      type="checkbox"
      class="peer smallest"
      :checked="isChecked"
      :required="computedRequired"
      :disabled="computedDisabled"
      @change="onInputChange"
    />

    <span aria-hidden="true" :class="computedClasses.inner()">
      <CheckIcon v-if="isChecked" class="size-3 text-gray-100" />
      <MinusIcon v-else-if="indeterminate" class="size-3" />
      <span v-else class="size-3" />
    </span>

    <span class="text-sm flex-1 shrink-0 empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
