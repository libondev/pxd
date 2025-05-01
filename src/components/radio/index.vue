<script lang="ts" setup>
import { twMerge } from 'tailwind-merge'
import { computed, inject } from 'vue'
import { useModelValue } from '../../composables/useModelValue'

interface Props {
  label?: string
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

const randomName = inject('radioGroupName', `P${Math.random()}`)

const modelValue = useModelValue(props, emits)

const computedChecked = computed(() => {
  return props.modelValue === props.value
})

const computedDisabled = computed(() => {
  return props.disabled
})

const computedInnerClasses = computed(() => {
  const basic = ['pxd-radio--inner size-4 rounded-full inline-flex items-center justify-center border motion-safe:transition-colors']

  basic.push('after:content-empty after:size-2 after:rounded-full after:bg-gray-1000 after:scale-0 motion-safe:after:transition-transform peer-checked:after:scale-100')

  if (computedChecked.value) {
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
  <label class="pxd-radio group inline-flex items-center" :class="{ 'is-disabled cursor-not-allowed text-gray-500': disabled }">
    <input
      v-model="modelValue"
      type="radio"
      :value="value"
      :name="randomName"
      class="hidden peer"
      :required="required"
      :disabled="disabled"
    >

    <span aria-hidden="true" :class="computedInnerClasses" />

    <span class="ml-2 text-sm empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
