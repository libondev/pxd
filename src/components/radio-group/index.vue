<script setup lang="ts">
import type { StackProps } from '../../types/components'
import { provide } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { provideRandomValue } from '../../composables/useRandomValueContext'
import Radio from '../radio/index.vue'
import Stack from '../stack/index.vue'

interface RadioGroupOptions extends StackProps {
  label: string
  value: string | number
  disabled?: boolean
}

interface Props {
  modelValue: string | number
  options?: RadioGroupOptions[]
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
  'update:modelValue': [Props['modelValue']]
}>()

const modelValue = useModelValue(props, emits)

provideRandomValue('radioGroupName')
provide('radioGroupProps', props)
</script>

<template>
  <Stack class="pxd-radio-group">
    <slot>
      <Radio
        v-for="option in options"
        :key="option.value"
        v-model="modelValue"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </Stack>
</template>
