<script lang="ts" setup>
import type { ComponentOption, ComponentSize } from '../../types/components'
import { provide } from 'vue'
import { useConfigProviderSize } from '../../composables/useConfigProviderContext'
import { useModelValue } from '../../composables/useModelValue'
import { provideUniqueId } from '../../composables/useUniqueIdContext'
import PSwitch from '../switch/index.vue'

interface Props {
  block?: boolean
  disabled?: boolean
  required?: boolean
  size?: ComponentSize
  modelValue?: string | number
  options?: ComponentOption[]
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
const computedSize = useConfigProviderSize(props.size, SIZES)

provideUniqueId('pxdSwitchGroupName')
provide('pxdSwitchGroupProps', props)
provide('pxdSwitchGroupModelValue', modelValue)
</script>

<template>
  <div class="pxd-switch-group rounded-md flex border p-1" :class="[block ? 'w-full' : 'w-max', computedSize]">
    <slot>
      <PSwitch
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
