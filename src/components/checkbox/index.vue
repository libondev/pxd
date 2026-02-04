<script lang="ts" setup>
import type { CheckboxProps } from '../../types/components/checkbox'
import CheckIcon from '@gdsicon/vue/check'
import MinusIcon from '@gdsicon/vue/minus'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useCheckboxGroupContext } from '../../contexts/checkbox'
import { getUniqueId } from '../../utils/uid'
import { checkboxVariant } from './cn'

defineOptions({
  name: 'PCheckbox',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<CheckboxProps>(), {
  modelValue: () => [],
  value: true,
})

const emits = defineEmits<{
  change: [NonNullable<CheckboxProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxProps['modelValue']>]
}>()

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
