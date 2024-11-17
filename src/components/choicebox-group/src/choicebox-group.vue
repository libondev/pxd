<script setup lang="ts">
import { getFlowDirection } from '../../_utils/css.js'
import { ChoiceboxInjectionKey, type ChoiceboxProps } from '../index.js'

defineOptions({
  name: 'PChoiceboxGroup',
})

const {
  direction = 'row',
  multiple = false,
} = defineProps<ChoiceboxProps>()

const modelValue = defineModel<string | string[]>({ required: true })

const layoutDirection = getFlowDirection(direction)

function onChoiceboxItemChange(value: string) {
  if (multiple) {
    const _modelValue = modelValue.value as string[]

    if (_modelValue.includes(value)) {
      modelValue.value = _modelValue.filter(v => v !== value)
    }
    else {
      _modelValue.push(value)
    }

    return
  }

  modelValue.value = value
}

provide(ChoiceboxInjectionKey, {
  multiple: toRef(() => multiple),
  modelValue,
  onChoiceboxItemChange,
})
</script>

<template>
  <ul
    class="pxd-choicebox list-none m-0 p-0 flex gap-3"
    :class="layoutDirection"
    role="group"
    :aria-label="title"
    :aria-multiselectable="multiple"
  >
    <slot />
  </ul>
</template>
