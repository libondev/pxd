<script setup lang="ts">
import type { CheckboxGroupEmits, CheckboxGroupProps } from './types'
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

const emits = defineEmits<CheckboxGroupEmits>()

provideCheckboxGroupContext({ props, emits })
</script>

<template>
  <PStack class="pxd-checkbox-group" role="group" aria-label="Checkbox Group" v-bind="$attrs">
    <slot>
      <PCheckbox v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
