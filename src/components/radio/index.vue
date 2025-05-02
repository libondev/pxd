<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { computed, inject } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import { useRandomValue } from '../../composables/useRandomValueContext'
import { getRandomId } from '../../utils/random'

interface Props {
  label?: string | number
  value: string | number
  required?: boolean
  disabled?: boolean
  modelValue?: string | number
}

defineOptions({
  name: 'PRadio',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<Props>()

const emits = defineEmits<{
  'update:modelValue': [Props['modelValue']]
}>()

const randomId = getRandomId()
const modelValue = useModelValue(props, emits)

const radioGroupName = useRandomValue('radioGroupName')
const radioGroupProps = inject('radioGroupProps', {
  disabled: false,
  required: false,
})

const isChecked = computed(() => props.modelValue === props.value)
const computedDisabled = computed(() => props.disabled || radioGroupProps.disabled)
const computedRequired = computed(() => props.required || radioGroupProps.required)

const computedInnerClasses = computed(() => {
  const basic = [
    'pxd-radio--inner size-4 rounded-full inline-flex items-center justify-center border peer-focus-ring motion-safe:transition-colors',
    'after:content-empty after:size-2 after:rounded-full after:bg-gray-1000 after:scale-40 after:opacity-0 peer-checked:after:scale-100 peer-checked:after:opacity-100 motion-safe:after:transition-all',
  ]

  if (isChecked.value) {
    if (computedDisabled.value) {
      basic.push('bg-gray-100 border-gray-500 after:bg-gray-500')
    }
    else {
      basic.push('bg-background border-gray-1000 peer-checked:after:scale-100')
    }
  }
  else {
    if (computedDisabled.value) {
      basic.push('bg-gray-100 border-gray-500')
    }
    else {
      basic.push('bg-background border-gray-alpha-400 group-hover:bg-gray-200')
    }
  }

  return twMerge(basic)
})
</script>

<template>
  <label
    class="pxd-radio group inline-flex items-center"
    :class="{ 'is-disabled cursor-not-allowed text-gray-500': computedDisabled }"
    :for="randomId"
  >
    <input
      :id="randomId"
      v-model="modelValue"
      type="radio"
      :value="value"
      class="smallest peer"
      :name="radioGroupName"
      :required="computedRequired"
      :disabled="computedDisabled"
    >

    <span aria-hidden="true" :class="computedInnerClasses" />

    <span class="ml-2 text-sm empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
