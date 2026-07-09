<script lang="ts" setup>
import type { RadioEmits, RadioProps } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useRadioGroupContext } from '../../contexts/radio'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PRadio',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<RadioProps>()
const emits = defineEmits<RadioEmits>()

const { classes: radioClasses } = useTailwindVariant(
  {
    base: 'pxd-radio--inner size-4 after:content-empty after:size-2 inline-flex items-center justify-center rounded-full border peer-focus-ring after:scale-40 after:rounded-full after:bg-primary after:opacity-0 peer-checked:after:scale-100 peer-checked:after:opacity-100 motion-safe:transition-colors motion-safe:after:transition-appearance',
    variants: {
      checked: {
        true: {
          base: 'border-primary bg-background-100 peer-checked:after:scale-100',
          disabled: 'border-gray-500 bg-gray-100 peer-disabled:after:bg-gray-500',
        },
        false: {
          base: 'border-gray-alpha-400 bg-background-100 group-hover/radio:bg-gray-200',
          disabled: 'border-gray-500 bg-gray-100',
        },
      },
      disabled: {},
    },
    compoundVariants: [
      {
        checked: true,
        disabled: false,
        class: 'border-primary bg-background-100 peer-checked:after:scale-100',
      },
      {
        checked: true,
        disabled: true,
        class: 'border-gray-500 bg-gray-100 peer-disabled:after:bg-gray-500',
      },
      {
        checked: false,
        disabled: false,
        class: 'border-gray-alpha-400 bg-background-100 group-hover/radio:bg-gray-200',
      },
      { checked: false, disabled: true, class: 'border-gray-500 bg-gray-100' },
    ],
  },
  { mergeAttrsClass: false },
)

const uniqueId = getUniqueId()

const radioGroupContext = useRadioGroupContext()
const radioGroupName = radioGroupContext?.name ?? getUniqueId()

const modelValue = useModelValue(
  radioGroupContext?.props ?? props,
  radioGroupContext?.emits ?? emits,
)

const isSelected = computed(() => modelValue.value === props.value)

const isDisabled = computed(() => props.disabled || radioGroupContext?.props.disabled || false)

const computedClasses = computed(() => {
  return radioClasses({
    checked: isSelected.value,
    disabled: isDisabled.value,
  })
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
    role="radio"
    :aria-selected="isSelected"
    :data-disabled="isDisabled"
    class="pxd-radio group/radio gap-2 inline-flex max-w-full cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed data-[disabled=true]:text-gray-500"
    :for="uniqueId"
    v-bind="$attrs"
  >
    <input
      :id="uniqueId"
      type="radio"
      :value="value"
      class="peer visually-hidden"
      :checked="isSelected"
      :disabled="isDisabled"
      :name="radioGroupName"
      @change="onInputChange"
    />

    <span aria-hidden="true" :class="computedClasses" />

    <span class="text-sm flex-1 shrink-0 leading-none empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
