<script lang="ts" setup>
import { CheckIcon, MinusIcon } from 'gdsi/vue'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'

interface Props {
  label?: string
  disabled?: boolean
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

const computedDisabled = computed(() => {
  return props.disabled
})

const computedBoxClasses = computed(() => {
  const basic = ['size-4 inline-flex items-center justify-center rounded-sm border motion-safe:transition-colors']

  if (props.modelValue) {
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
  <label class="pxd-checkbox flex items-center group" :class="{ 'is-disabled cursor-not-allowed text-gray-500': disabled }">
    <input v-model="modelValue" :disabled="disabled" type="checkbox" class="hidden peer">

    <span :class="computedBoxClasses">
      <CheckIcon v-if="modelValue" class="text-xs text-gray-100" />
      <MinusIcon v-else-if="indeterminate" class="text-xs" />
    </span>

    <span class="ml-2 text-sm">
      <slot>
        {{ label }}
      </slot>
    </span>
  </label>
</template>
