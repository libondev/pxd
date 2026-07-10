<script lang="ts" setup>
import type { SwitchItemProps, SwitchItemEmits } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useSwitchContext } from '../../contexts/switch'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PSwitchItem',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<SwitchItemProps>()
const emits = defineEmits<SwitchItemEmits>()

const { classes: switchClasses } = useTailwindVariant(
  {
    base: 'pxd-switch-item--label px-2.5 font-medium flex size-full items-center justify-center truncate rounded-sm text-foreground-secondary peer-focus-ring outline-none select-none peer-checked:bg-gray-100 peer-disabled:cursor-not-allowed peer-disabled:text-gray-800 empty:hidden hover:text-foreground motion-safe:transition-appearance',
    variants: {
      disabled: {
        false: 'peer-checked:text-foreground',
      },
    },
  },
  { mergeAttrsClass: false },
)

const uniqueId = getUniqueId()

const switchGroupContext = useSwitchContext()
const switchGroupName = switchGroupContext?.name ?? getUniqueId()

const modelValue = useModelValue(
  switchGroupContext?.props ?? props,
  switchGroupContext?.emits ?? emits,
)

const isChecked = computed(() => modelValue.value === props.value)

const isDisabled = computed(() => props.disabled || switchGroupContext?.props.disabled || false)

const computedClasses = computed(() => {
  return switchClasses({ disabled: isDisabled.value })
})

function onInputChange() {
  if (isDisabled.value) {
    return
  }

  modelValue.value = props.value
}
</script>

<template>
  <label
    role="switch"
    :aria-selected="isChecked"
    :data-disabled="isDisabled"
    class="pxd-switch-item flex-1 shrink-0 cursor-pointer"
    :for="uniqueId"
    v-bind="$attrs"
  >
    <input
      :id="uniqueId"
      type="radio"
      :value="value"
      class="peer visually-hidden"
      :checked="isChecked"
      :name="switchGroupName"
      :disabled="isDisabled"
      @change="onInputChange"
    />

    <div :class="computedClasses" @focusin="onInputChange">
      <slot>
        {{ label }}
      </slot>
    </div>
  </label>
</template>
