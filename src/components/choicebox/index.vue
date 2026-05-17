<script lang="ts" setup>
import type { ChoiceboxEmits, ChoiceboxProps } from './types'
import { provideChoiceboxContext } from '../../contexts/choicebox'
import { getUniqueId } from '../../utils/helper'
import PChoiceboxItem from '../choicebox-item/index.vue'

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

provideChoiceboxContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <div
    aria-label="Choicebox Group"
    :aria-multiselectable="multiple"
    :role="multiple ? 'group' : 'radiogroup'"
    class="pxd-choicebox gap-3 flex w-full max-w-full flex-wrap"
    v-bind="$attrs"
  >
    <slot>
      <PChoiceboxItem v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </div>
</template>
