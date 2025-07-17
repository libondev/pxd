<script lang="ts" setup>
import type { ComponentLabel } from '../../types/components'
import { computed, inject } from 'vue'
import { useUniqueId } from '../../composables/useUniqueIdContext'
import { getUniqueId } from '../../utils/uid'

interface Props {
  label?: ComponentLabel
  value: string | number
  disabled?: boolean
  required?: boolean
}

defineOptions({
  name: 'PSwitch',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<Props>()

const uniqueId = getUniqueId()
const modelValue = inject('pxdSwitchGroupModelValue', { value: '' })

const switchGroupName = useUniqueId('pxdSwitchGroupName')
const switchGroupProps = inject('pxdSwitchGroupProps', {
  disabled: false,
  required: false,
})

const isChecked = computed(() => modelValue.value === props.value)
const computedDisabled = computed(() => props.disabled || switchGroupProps.disabled)
const computedRequired = computed(() => props.required || switchGroupProps.required)

const computedClass = computed(() => {
  const classes = [
    'pxd-switch--label w-full h-full px-3 flex items-center justify-center text-foreground-secondary rounded-sm truncate text-sm peer-focus-ring',
    'font-medium select-none empty:hidden peer-disabled:cursor-not-allowed peer-checked:bg-gray-100 motion-safe:transition-all',
  ]

  if (!computedDisabled.value) {
    classes.push('peer-checked:text-foreground')
  }

  return classes.join(' ')
})
</script>

<template>
  <label
    :aria-checked="isChecked"
    class="pxd-switch flex-1 cursor-pointer"
    :for="uniqueId"
  >
    <input
      :id="uniqueId"
      v-model="modelValue"
      type="radio"
      :value="value"
      class="smallest peer"
      :checked="isChecked"
      :name="switchGroupName"
      :disabled="computedDisabled"
      :required="computedRequired"
    >

    <div :class="computedClass">
      <slot>
        {{ label }}
      </slot>
    </div>
  </label>
</template>
