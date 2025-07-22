<script lang="ts" setup>
import type { RadioProps } from '../../types/components/radio'
import { computed } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { useUniqueId } from '../../composables/useUniqueIdContext'
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

const isChecked = computed(() => modelValue.value === props.value)
const computedDisabled = computed(() => props.disabled || radioGroupContext?.disabled)
const computedRequired = computed(() => props.required || radioGroupContext?.required)

const computedInnerClasses = computed(() => {
  const classes = [
    'pxd-radio--inner size-4 rounded-full inline-flex items-center justify-center border peer-focus-ring motion-safe:transition-colors',
    'after:content-empty after:size-2 after:rounded-full after:bg-primary after:scale-40 after:opacity-0 peer-checked:after:scale-100 peer-checked:after:opacity-100 motion-safe:after:transition-all',
  ]

  if (isChecked.value) {
    classes.push(
      computedDisabled.value
        ? 'bg-gray-100 border-gray-500 after:bg-gray-500'
        : 'bg-background border-primary peer-checked:after:scale-100',
    )
  } else {
    classes.push(
      computedDisabled.value
        ? 'bg-gray-100 border-gray-500'
        : 'bg-background border-gray-alpha-400 group-hover/radio:bg-gray-200',
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
    :aria-checked="isChecked"
    class="pxd-radio group/radio inline-flex items-center gap-2"
    :class="{ 'is-disabled cursor-not-allowed text-gray-500': computedDisabled }"
    :for="uniqueId"
  >
    <input
      :id="uniqueId"
      type="radio"
      :value="value"
      class="smallest peer"
      :checked="isChecked"
      :name="radioGroupName"
      :required="computedRequired"
      :disabled="computedDisabled"
      @change="onChangeValue"
    >

    <span aria-hidden="true" :class="computedInnerClasses" />

    <span class="flex-1 text-sm empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
