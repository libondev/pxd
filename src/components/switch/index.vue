<script lang="ts" setup>
import { computed } from 'vue'
import { useUniqueId } from '../../composables/use-unique-id-context'
import { useSwitchGroupContext, useSwitchGroupModelValue } from '../../contexts/switch'
import { getUniqueId } from '../../utils/uid'
import { tv } from 'tailwind-variants'
import type { SwitchProps } from './types'

defineOptions({
  name: 'PSwitch',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<SwitchProps>()

const switchVariant = tv({
  base: 'pxd-switch--label px-2.5 text-sm font-medium flex size-full items-center justify-center truncate rounded-sm text-foreground-secondary peer-focus-ring select-none peer-checked:bg-gray-100 peer-disabled:cursor-not-allowed peer-disabled:text-gray-800 empty:hidden hover:text-foreground motion-safe:transition-all',
  variants: {
    disabled: {
      true: '',
      false: 'peer-checked:text-foreground',
    },
  },
  defaultVariants: {
    disabled: false,
  },
})

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
    />

    <div :class="computedClasses" @focusin="onSwitchFocusIn">
      <slot>
        {{ label }}
      </slot>
    </div>
  </label>
</template>
