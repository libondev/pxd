<template>
  <div class="px-checkbox-group">
    <slot />
  </div>
</template>

<script lang="ts" setup name="PxCheckboxGroup">
import { checkboxGroupProps } from './constraints'
import { checkboxGroupSymbol } from '../../_internal'
import { toArray } from '../../_utils'

const props = defineProps(checkboxGroupProps)
const emits = defineEmits<{
  (e: 'update:modelValue', value: typeof props.modelValue): void
}>()

const modelValue = computed({
  get () {
    return props.modelValue
  },
  set (value) {
    emits('update:modelValue', value)
  }
})

const unwatchModelValue = watch(() => props.modelValue, (value) => {
  if (Array.isArray(value)) {
    return
  }

  modelValue.value = toArray(value)
}, { immediate: true, flush: 'pre' })

function onValueChange (value: typeof props.modelValue[number]) {
  const idx = modelValue.value.indexOf(value)

  if (!~idx) {
    modelValue.value.push(value)
  } else {
    modelValue.value.splice(idx, 1)
  }
}

function getCheckedStatus (value: typeof props.modelValue[number]) {
  return modelValue.value.includes?.(value)
}

provide(checkboxGroupSymbol, {
  disabled: props.disabled,
  onValueChange,
  getCheckedStatus
})

onBeforeUnmount(() => {
  unwatchModelValue()
})

defineExpose({
  onValueChange
})
</script>
