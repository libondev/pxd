<script setup lang="ts">
import type { RadioGroupEmits, RadioGroupProps } from './types'
import { provideRadioGroupContext } from '../../contexts/radio'
import PRadio from '../radio/index.vue'
import PStack from '../stack/index.vue'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PRadioGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<RadioGroupProps>()
const emits = defineEmits<RadioGroupEmits>()

provideRadioGroupContext({ props, emits, name: getUniqueId() })
</script>

<template>
  <PStack class="pxd-radio-group" role="radiogroup" aria-label="Radio Group" v-bind="$attrs">
    <slot>
      <PRadio v-for="option in options" :key="option.value" v-bind="option" />
    </slot>
  </PStack>
</template>
