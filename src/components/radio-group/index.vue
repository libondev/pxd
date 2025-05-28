<script setup lang="ts">
import type { ComponentOptions } from '../../types'
import { provide } from 'vue'
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

function onUpdateModelValue(v: Props['modelValue']) {
  emits('change', v)
  emits('update:modelValue', v)
}

provideRandomValue('radioGroupName')
provide('radioGroupProps', props)
</script>

<template>
  <PStack class="pxd-radio-group" v-bind="$attrs">
    <slot>
      <PRadio
        v-for="option in options"
        :key="option.value"
        :model-value="modelValue"
        v-bind="option"
        @update:model-value="onUpdateModelValue"
      />
    </slot>
  </PStack>
</template>
