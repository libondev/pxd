<script lang="ts" setup>
import { CheckIcon, MinusIcon } from 'gdsi/vue'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'

interface Props {
  label?: string
  value?: string | number | boolean
  disabled?: boolean
  required?: boolean
  modelValue?: boolean
  indeterminate?: boolean
}

defineOptions({
  name: 'PCheckbox',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = defineProps<Props>()

const emits = defineEmits<{
  'update:modelValue': [boolean]
}>()

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value: boolean) {
    emits('update:modelValue', value)
  },
})

const computedChecked = computed(() => {
  if (props.value !== undefined) {
    return props.modelValue === props.value
  }

  return props.modelValue
})

const computedDisabled = computed(() => {
  return props.disabled
})

const computedInnerClasses = computed(() => {
  const basic = ['pxd-checkbox--inner size-4 flex-shrink-0 inline-flex items-center justify-center rounded-sm border overflow-hidden transform-gpu motion-safe:transition-colors']

  if (computedChecked.value) {
    if (computedDisabled.value) {
      basic.push('bg-gray-600 border-gray-600')
    }
    else {
      basic.push('bg-gray-1000 border-gray-1000')
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
  <label class="pxd-checkbox inline-flex items-center group" :class="{ 'is-disabled cursor-not-allowed text-gray-500': disabled }">
    <input
      v-model="modelValue"
      type="checkbox"
      class="hidden peer"
      :required="required"
      :disabled="disabled"
    >

    <span aria-hidden="true" :class="computedInnerClasses">
      <CheckIcon v-if="computedChecked" class="size-3 text-gray-100" />
      <MinusIcon v-else-if="indeterminate" class="size-3 text-gray-100" />
      <span v-else class="size-3" />
    </span>

    <span class="ml-2 text-sm empty:hidden">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
