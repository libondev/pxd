<script setup lang="ts">
import { ChoiceboxInjectionKey, type ChoiceboxProps } from '..'

defineOptions({
  name: 'PChoiceboxGroup',
})

const props = withDefaults(
  defineProps<ChoiceboxProps>(),
  {
    direction: 'row',
  },
)

const multiple = toRef(props.multiple)

const modelValue = defineModel<string | string[]>({ required: true })

const layoutDirection = getLayoutDirection(props.direction)

function onChoiceboxItemChange(value: string) {
  if (multiple.value) {
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
  multiple,
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
