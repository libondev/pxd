<script lang="ts" setup>
import type { ComponentLabel } from '../../types/shared'
import { computed } from 'vue'
import { useUniqueId } from '../../composables/use-unique-id-context'
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

const switchGroupName = useUniqueId('SwitchGroupName')
const switchGroupContext = useSwitchGroupContext()
const switchGroupModelValue = useSwitchGroupModelValue()

const isChecked = computed(() => switchGroupModelValue.value === props.value)
const computedDisabled = computed(() => props.disabled || switchGroupContext.disabled)
const computedRequired = computed(() => props.required || switchGroupContext.required)

const computedClass = computed(() => {
  const classes = [
    'pxd-switch--label px-3 text-sm flex size-full items-center justify-center truncate rounded-sm text-foreground-secondary peer-focus-ring',
    'font-medium select-none peer-checked:bg-gray-100 peer-disabled:cursor-not-allowed peer-disabled:text-gray-800 empty:hidden motion-safe:transition-all',
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
    class="pxd-switch flex-1 shrink-0 cursor-pointer"
    :for="uniqueId"
  >
    <input
      :id="uniqueId"
      v-model="switchGroupModelValue"
      type="radio"
      :value="value"
      class="peer smallest"
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
