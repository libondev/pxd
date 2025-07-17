<script lang="ts" setup>
import type { ComponentLabel, ComponentValue } from '../../types/components'
import CheckIcon from '@gdsicon/vue/check'
import MinusIcon from '@gdsicon/vue/minus'
import { computed, inject } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { getUniqueId } from '../../utils/uid'

interface Props {
  label?: ComponentLabel
  value?: ComponentValue
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue | ComponentValue[]
  indeterminate?: boolean
}

defineOptions({
  name: 'PCheckbox',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: () => [],
    value: true,
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const uniqueId = getUniqueId()
const modelValue = useModelValue(props, emits)

const checkboxGroupProps = inject('pxdCheckboxGroupProps', {
  disabled: false,
  required: false,
})

const isChecked = computed(() => {
  if (Array.isArray(modelValue.value)) {
    return modelValue.value.includes(props.value)
  }

  if (typeof props.value === 'boolean') {
    return modelValue.value as boolean
  }

  return modelValue.value === props.value
})

const computedDisabled = computed(() => props.disabled || checkboxGroupProps.disabled)
const computedRequired = computed(() => props.required || checkboxGroupProps.required)

const computedClass = computed(() => {
  const classes = [
    'pxd-checkbox--inner size-4 shrink-0 inline-flex items-center justify-center peer-focus-ring',
    'rounded-sm border overflow-hidden transform-gpu motion-safe:transition-colors',
  ]

  if (isChecked.value) {
    classes.push(
      computedDisabled.value
        ? 'bg-gray-600 border-gray-600'
        : 'bg-primary border-primary',
    )
  } else {
    classes.push(
      computedDisabled.value
        ? 'bg-gray-100 border-gray-500'
        : 'bg-background border-gray-alpha-400 group-hover/checkbox:bg-gray-200',
    )
  }

  return classes.join(' ')
})

function toggleChecked(isChecked: boolean) {
  if (Array.isArray(modelValue.value)) {
    modelValue.value = isChecked
      ? [...modelValue.value, props.value]
      : modelValue.value.filter(v => v !== props.value)

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
    :aria-checked="isChecked"
    class="pxd-checkbox inline-flex items-center group/checkbox gap-2"
    :class="{ 'is-disabled cursor-not-allowed text-gray-500': computedDisabled }"
    :for="uniqueId"
  >
    <input
      :id="uniqueId"
      :value="value"
      type="checkbox"
      class="smallest peer"
      :checked="isChecked"
      :required="computedRequired"
      :disabled="computedDisabled"
      @change="onInputChange"
    >

    <span aria-hidden="true" :class="computedClass">
      <CheckIcon v-if="isChecked" class="size-3 text-gray-100" />
      <MinusIcon v-else-if="indeterminate" class="size-3" />
      <span v-else class="size-3" />
    </span>

    <span class="flex-1 text-sm empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
