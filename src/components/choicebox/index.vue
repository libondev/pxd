<script lang="ts" setup>
import type { ChoiceboxEmits, ChoiceboxProps } from './types'
import { computed, markRaw } from 'vue'
import { provideChoiceboxContext } from '../../contexts/choicebox'
import PCheckboxGroup from '../checkbox-group/index.vue'
import PChoiceboxItem from '../choicebox-item/index.vue'
import PRadioGroup from '../radio-group/index.vue'

defineOptions({
  name: 'PChoicebox',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<ChoiceboxProps>(), {
  gap: 3,
})
const emits = defineEmits<ChoiceboxEmits>()

const renderAs = computed(() => markRaw(props.multiple ? PCheckboxGroup : PRadioGroup))

function onUpdateModelValue(value: any) {
  emits('change', value)
  emits('update:modelValue', value)
}

provideChoiceboxContext({ props, emits })
</script>

<template>
  <Component
    :is="renderAs"
    :gap="gap"
    :options="options"
    :disabled="disabled"
    :model-value="modelValue"
    :aria-multiselectable="multiple"
    class="pxd-choicebox w-full"
    :role="multiple ? 'group' : 'radiogroup'"
    v-bind="$attrs"
    @update:model-value="onUpdateModelValue"
  >
    <slot>
      <PChoiceboxItem v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </Component>
</template>
