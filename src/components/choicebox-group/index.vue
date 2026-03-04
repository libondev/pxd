<script lang="ts" setup>
import type { ChoiceboxGroupEmits, ChoiceboxGroupProps } from './types'
import { computed, markRaw } from 'vue'
import PCheckboxGroup from '../checkbox-group/index.vue'
import PChoicebox from '../choicebox/index.vue'
import PRadioGroup from '../radio-group/index.vue'
import { provideChoiceboxGroupContext } from '../../contexts/choicebox'

defineOptions({
  name: 'PChoiceboxGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ChoiceboxGroupProps>(), {
  gap: 3,
})
const emits = defineEmits<ChoiceboxGroupEmits>()

const renderAs = computed(() => markRaw(props.multiple ? PCheckboxGroup : PRadioGroup))

function onUpdateModelValue(value: any) {
  emits('change', value)
  emits('update:modelValue', value)
}

provideChoiceboxGroupContext({ props, emits })
</script>

<template>
  <Component
    :is="renderAs"
    :gap="gap"
    :options="options"
    :disabled="disabled"
    :model-value="modelValue"
    :aria-multiselectable="multiple"
    class="pxd-choicebox-group w-full"
    :role="multiple ? 'group' : 'radiogroup'"
    v-bind="$attrs"
    @update:model-value="onUpdateModelValue"
  >
    <slot>
      <PChoicebox v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </Component>
</template>
