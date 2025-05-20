<script setup lang="ts">
import type { ComponentOptions } from '../../types'
import { provide } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import PCheckbox from '../checkbox/index.vue'
import PStack from '../stack/index.vue'

interface Props {
  disabled?: boolean
  required?: boolean
  modelValue?: (string | number)[]
  options?: ComponentOptions[]
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
  'update:modelValue': [NonNullable<Props['modelValue']>]
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
  <PStack class="pxd-checkbox-group">
    <slot>
      <PCheckbox
        v-for="option in options"
        :key="option.value"
        v-model="modelValue"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </PStack>
</template>
