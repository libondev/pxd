<script lang="ts" setup>
import { CheckIcon, MinusIcon } from 'gdsi/vue'
import { twMerge } from 'tailwind-merge'
import { computed, inject } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { getRandomId } from '../../utils/random'

type ValueType = string | number | boolean

interface Props {
  label?: string | number
  value?: ValueType
  disabled?: boolean
  required?: boolean
  modelValue?: ValueType | ValueType[]
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
  { modelValue: false, value: true },
)

const emits = defineEmits<{
  'update:modelValue': [Props['modelValue']]
}>()

const randomId = getRandomId()
const modelValue = useModelValue(props, emits)

const checkboxGroupProps = inject('checkboxGroupProps', {
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

const computedInnerClasses = computed(() => {
  const basic = [
    'pxd-checkbox--inner size-4 flex-shrink-0 inline-flex items-center justify-center peer-focus-ring',
    'rounded-sm border overflow-hidden transform-gpu motion-safe:transition-colors',
  ]

  if (isChecked.value) {
    basic.push(
      computedDisabled.value
        ? 'bg-gray-600 border-gray-600'
        : 'bg-gray-1000 border-gray-1000',
    )
  }
  else {
    basic.push(
      computedDisabled.value
        ? 'bg-gray-100 border-gray-500'
        : 'bg-background border-gray-alpha-400 group-hover/checkbox:bg-gray-200',
    )
  }

  return twMerge(basic)
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
    class="pxd-checkbox inline-flex items-center group/checkbox"
    :class="{ 'is-disabled cursor-not-allowed text-gray-500': computedDisabled }"
    :for="randomId"
  >
    <input
      :id="randomId"
      :value="value"
      type="checkbox"
      class="smallest peer"
      :checked="isChecked"
      :required="computedRequired"
      :disabled="computedDisabled"
      @change="onInputChange"
    >
    <span aria-hidden="true" :class="computedInnerClasses">
      <CheckIcon v-if="isChecked" class="size-3 text-gray-100" />
      <MinusIcon v-else-if="indeterminate" class="size-3" />
      <span v-else class="size-3" />
    </span>

    <span class="ml-2 text-sm empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
