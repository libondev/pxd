<script setup lang="ts">
import { provide } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import Checkbox from '../checkbox/index.vue'
import Stack from '../stack/index.vue'

interface CheckboxGroupOptions {
  label?: string | number
  value: string | number
  disabled?: boolean
}

interface Props {
  disabled?: boolean
  required?: boolean
  modelValue?: (string | number)[]
  options?: CheckboxGroupOptions[]
}

defineOptions({
  name: 'PCheckboxGroup',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: () => [],
    options: () => [],
  },
)

const emits = defineEmits<{
  'update:modelValue': [Props['modelValue']]
}>()

const modelValue = useModelValue(props, emits)

function isCheckedAll() {
  return props.options.every(option => modelValue.value.includes(option.value))
}

function isCheckedPartial() {
  return modelValue.value.length > 0 && !isCheckedAll()
}

provide('checkboxGroupProps', props)

defineExpose({
  isCheckedAll,
  isCheckedPartial,
})
</script>

<template>
  <Stack class="pxd-checkbox-group">
    <slot>
      <Checkbox
        v-for="option in options"
        :key="option.value"
        v-model="modelValue"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </Stack>
</template>
