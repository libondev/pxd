<script lang="ts" setup>
import type { RadioProps } from '../../types/components/radio'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useUniqueId } from '../../composables/use-unique-id-context'
import { useRadioGroupContext } from '../../contexts/radio'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PRadio',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<RadioProps>()

const emits = defineEmits<{
  'update:modelValue': [NonNullable<RadioProps['modelValue']>]
}>()

const uniqueId = getUniqueId()
const modelValue = useModelValue(props, emits)

const radioGroupName = useUniqueId('RadioGroupName')
const radioGroupContext = useRadioGroupContext()

const isChecked = computed(() => (radioGroupContext?.modelValue ?? modelValue.value) === props.value)
const computedDisabled = computed(() => props.disabled || radioGroupContext?.disabled)
const computedRequired = computed(() => props.required || radioGroupContext?.required)

const computedInnerClasses = computed(() => {
  const classes = [
    'pxd-radio--inner size-4 inline-flex items-center justify-center rounded-full border peer-focus-ring motion-safe:transition-colors',
    'after:content-empty after:size-2 after:scale-40 after:rounded-full after:bg-primary after:opacity-0 peer-checked:after:scale-100 peer-checked:after:opacity-100 motion-safe:after:transition-all',
  ]

  if (isChecked.value) {
    classes.push(
      computedDisabled.value
        ? 'bg-gray-100 border-gray-500 peer-disabled:after:bg-gray-500'
        : 'bg-background-100 border-primary peer-checked:after:scale-100',
    )
  } else {
    classes.push(
      computedDisabled.value
        ? 'bg-gray-100 border-gray-500'
        : 'bg-background-100 border-gray-alpha-400 group-hover/radio:bg-gray-200',
    )
  }

  return classes.join(' ')
})

function onChangeValue() {
  emits('update:modelValue', props.value)
}
</script>

<template>
  <label
    role="radio"
    :aria-checked="isChecked"
    :data-disabled="computedDisabled"
    class="pxd-radio group/checkbox gap-2 inline-flex cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed"
    :class="{ 'is-disabled text-gray-500': computedDisabled }"
    :for="uniqueId"
  >
    <input
      :id="uniqueId"
      type="radio"
      :value="value"
      class="peer smallest"
      :checked="isChecked"
      :name="radioGroupName"
      :required="computedRequired"
      :disabled="computedDisabled"
      @change="onChangeValue"
    >

    <span aria-hidden="true" :class="computedInnerClasses" />

    <span class="text-sm flex-1 empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
