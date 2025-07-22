<script lang="ts" setup>
import type { ComponentLabel } from '../../types/shared'
import { computed } from 'vue'
import { injectUniqueId } from '../../composables/useUniqueIdContext'
import { useSwitchGroupContext, useSwitchGroupModelValue } from '../../contexts/switch'
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

const switchGroupName = injectUniqueId('SwitchGroupName')
const switchGroupContext = useSwitchGroupContext()
const switchGroupModelValue = useSwitchGroupModelValue()

const isChecked = computed(() => switchGroupModelValue.value === props.value)
const computedDisabled = computed(() => props.disabled || switchGroupContext.disabled)
const computedRequired = computed(() => props.required || switchGroupContext.required)

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
      v-model="switchGroupModelValue"
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
