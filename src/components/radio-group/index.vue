<script setup lang="ts">
import type { RadioGroupEmits, RadioGroupProps } from '../radio/types'
import { useModelValue } from '../../composables/use-model-value'
import { provideUniqueId } from '../../composables/use-unique-id-context'
import { provideRadioGroupContext } from '../../contexts/radio'
import PRadio from '../radio/index.vue'
import PStack from '../stack/index.vue'

defineOptions({
  name: 'PRadioGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<RadioGroupProps>(), {
  options: () => [],
})

const emits = defineEmits<RadioGroupEmits>()

const modelValue = useModelValue(props, emits)

provideUniqueId('RadioGroupName')
provideRadioGroupContext(props)
</script>

<template>
  <PStack class="pxd-radio-group" role="radiogroup" aria-label="Radio Group" v-bind="$attrs">
    <slot>
      <PRadio
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
