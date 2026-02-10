<script lang="ts" setup>
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useUniqueId } from '../../composables/use-unique-id-context'
import { useRadioGroupContext } from '../../contexts/radio'
import { getUniqueId } from '../../utils/uid'
import { radioVariant } from './cn'
import type { RadioEmits, RadioProps } from './types'

defineOptions({
  name: 'PRadio',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<RadioProps>()

const emits = defineEmits<RadioEmits>()

const uniqueId = getUniqueId()
const modelValue = useModelValue(props, emits)

const radioGroupName = useUniqueId('RadioGroupName')
const radioGroupContext = useRadioGroupContext()

const isChecked = computed(
  () => (radioGroupContext?.modelValue ?? modelValue.value) === props.value,
)
const computedDisabled = computed(() => props.disabled || radioGroupContext?.disabled)
const computedRequired = computed(() => props.required || radioGroupContext?.required)

const computedClasses = computed(() => {
  return radioVariant({
    checked: isChecked.value,
    disabled: computedDisabled.value,
  })
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
    class="pxd-radio group/radio gap-2 inline-flex max-w-full cursor-pointer touch-manipulation items-center data-[disabled=true]:cursor-not-allowed"
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
    />

    <span aria-hidden="true" :class="computedClasses" />

    <span class="text-sm flex-1 shrink-0 empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
