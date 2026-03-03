<script lang="ts" setup>
import type { SwitchProps, SwitchEmits } from './types'
import { computed } from 'vue'
import { useSwitchGroupContext } from '../../contexts/switch'
import { useModelValue } from '../../composables/use-model-value'
import { getUniqueId } from '../../utils/uid'
import { tv } from 'tailwind-variants'

defineOptions({
  name: 'PSwitch',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<SwitchProps>()
const emits = defineEmits<SwitchEmits>()

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

const switchGroupContext = useSwitchGroupContext()
const switchGroupName = switchGroupContext?.name ?? getUniqueId()

const modelValue = useModelValue(
  switchGroupContext?.props ?? props,
  switchGroupContext?.emits ?? emits,
)

const isChecked = computed(() => modelValue.value === props.value)

const computedDisabled = computed(() => props.disabled || switchGroupContext?.props.disabled)

const computedClasses = computed(() => {
  return switchVariant({ disabled: computedDisabled.value })
})

function onInputChange() {
  if (computedDisabled.value) {
    return
  }

  modelValue.value = props.value
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
      type="radio"
      :value="value"
      class="peer visually-hidden"
      :checked="isChecked"
      :name="switchGroupName"
      :disabled="computedDisabled"
      @change="onInputChange"
    />

    <div :class="computedClasses" @focusin="onInputChange">
      <slot>
        {{ label }}
      </slot>
    </div>
  </label>
</template>
