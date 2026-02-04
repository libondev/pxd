<script setup lang="ts">
import type { CheckboxGroupProps } from '../../types/components/checkbox'
import { useModelValue } from '../../composables/use-model-value'
import { provideCheckboxGroupContext } from '../../contexts/checkbox'
import PCheckbox from '../checkbox/index.vue'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PCheckboxGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<CheckboxGroupProps>(), {
  modelValue: () => [],
  options: () => [],
})

const emits = defineEmits<{
  change: [NonNullable<CheckboxGroupProps['modelValue']>]
  'update:modelValue': [NonNullable<CheckboxGroupProps['modelValue']>]
}>()

const modelValue = useModelValue(props, emits)

function isCheckedAll() {
  const { options = [] } = props

  if (options.length === 0) {
    return false
  }

  return options.every((option) => modelValue.value.includes(option.value))
}

function isCheckedPartial() {
  return modelValue.value.length > 0 && !isCheckedAll()
}

provideCheckboxGroupContext(props)

defineExpose({
  isCheckedAll,
  isCheckedPartial,
})
</script>

<template>
  <PStack class="pxd-checkbox-group" role="group" aria-label="Checkbox Group" v-bind="$attrs">
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
