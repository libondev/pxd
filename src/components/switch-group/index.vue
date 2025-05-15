<script lang="ts" setup>
import type { ComponentOptions, ComponentSize } from '../../types/components'
import { provide } from 'vue'
import { useComputedSize } from '../../composables/useComputedSize'
import { useModelValue } from '../../composables/useModelValue'
import { provideRandomValue } from '../../composables/useRandomValueContext'
import Switch from '../switch/index.vue'

interface Props {
  block?: boolean
  disabled?: boolean
  required?: boolean
  size?: ComponentSize
  modelValue?: string | number
  options?: ComponentOptions[]
}

defineOptions({
  name: 'PSwitchGroup',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    options: () => [],
    modelValue: '',
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const SIZES = {
  sm: 'h-7.5',
  md: 'h-9',
  lg: 'h-10',
}

const modelValue = useModelValue(props, emits)
const computedSize = useComputedSize(props.size, SIZES)

provideRandomValue('switchGroupName')
provide('switchGroupProps', props)
provide('switchGroupModelValue', modelValue)
</script>

<template>
  <div class="pxd-switch-group rounded-md flex border p-1" :class="[block ? 'w-full' : 'w-max', computedSize]">
    <slot>
      <Switch
        v-for="option in options"
        :key="option.value"
        v-model="modelValue"
        :label="option.label"
        :value="option.value"
        :disabled="option.disabled"
      />
    </slot>
  </div>
</template>
