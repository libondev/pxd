<script setup lang="ts">
import type { ComponentOptions } from '../../types'
import { provide } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { provideRandomValue } from '../../composables/useRandomValueContext'
import PRadio from '../radio/index.vue'
import PStack from '../stack/index.vue'

interface Props {
  disabled?: boolean
  required?: boolean
  modelValue: string | number
  options?: ComponentOptions[]
}

defineOptions({
  name: 'PRadioGroup',
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
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const modelValue = useModelValue(props, emits)

provideRandomValue('radioGroupName')
provide('radioGroupProps', props)
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
