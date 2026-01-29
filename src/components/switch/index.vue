<script lang="ts" setup>
import type { ComponentLabel } from '../../types/shared'
import { computed } from 'vue'
import { useUniqueId } from '../../composables/use-unique-id-context'
import { useSwitchGroupContext, useSwitchGroupModelValue } from '../../contexts/switch'
import { getUniqueId } from '../../utils/uid'
import { switchVariant } from './cn'

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

const computedClasses = computed(() => {
  return switchVariant({ disabled: computedDisabled.value })
})

function onSwitchFocusIn() {
  if (computedDisabled.value) {
    return
  }

  switchGroupModelValue.value = props.value
}
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

    <div :class="computedClasses" @focusin="onSwitchFocusIn">
      <slot>
        {{ label }}
      </slot>
    </div>
  </label>
</template>
