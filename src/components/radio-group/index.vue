<script setup lang="ts">
import type { ComponentOption, ComponentValue } from '../../types'
import { provide } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { provideRandomValue } from '../../composables/useRandomValueContext'
import PRadio from '../radio/index.vue'
import PStack from '../stack/index.vue'

interface Props {
  disabled?: boolean
  required?: boolean
  modelValue?: ComponentValue
  options?: ComponentOption[]
}

defineOptions({
  name: 'PRadioGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    options: () => [],
  },
)

const emits = defineEmits<{
  'change': [NonNullable<Props['modelValue']>]
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const modelValue = useModelValue(props, emits)

provideRandomValue('pxdRadioGroupName')
provide('pxdRadioGroupProps', props)
</script>

<template>
  <PStack class="pxd-radio-group" v-bind="$attrs">
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
