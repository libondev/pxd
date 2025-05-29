<script lang="ts" setup>
import type { ComponentOption, ComponentValue } from '../../types/components'
import { computed, markRaw, provide, useAttrs } from 'vue'
import { useModelValue } from '../../composables/useModelValue'
import PCheckboxGroup from '../checkbox-group/index.vue'
import PRadioGroup from '../radio-group/index.vue'

interface Option extends ComponentOption {
  description?: string
}

interface BaseProps {
  label?: string
  multiple?: boolean
  required?: boolean
  disabled?: boolean
  options?: Option[]
}

interface Props extends BaseProps {
  modelValue?: BaseProps['multiple'] extends true
    ? ComponentValue[]
    : ComponentValue
}

defineOptions({
  name: 'PChoiceboxGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    type: 'radio',
    required: false,
    disabled: false,
    modelValue: '',
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const attrs = useAttrs()

const modelValue = useModelValue(props, emits)

const renderComponent = computed(() => markRaw(props.multiple ? PCheckboxGroup : PRadioGroup))

const computedAttrs = computed(() => {
  const { disabled, label, multiple, required, options } = props
  const { class: classes, ...rest } = attrs

  return {
    'role': multiple ? 'group' : 'radiogroup',
    'aria-label': label,
    'aria-required': required,
    'aria-multiselectable': multiple,
    'gap': attrs.gap || '3',
    disabled,
    required,
    options,
    label,
    ...rest,
  }
})

provide('choiceboxGroupProps', props)
provide('choiceboxGroupModelValue', modelValue)
</script>

<template>
  <div class="pxd-choicebox-group w-full">
    <div v-if="label || $slots.label" class="pxd-form--label">
      <slot name="label">
        {{ label }}
      </slot>
    </div>

    <component
      :is="renderComponent"
      v-model="modelValue"
      v-bind="computedAttrs"
    >
      <slot>
        <PChoicebox
          v-for="option in options"
          :key="option.value"
          v-model="modelValue"
          v-bind="option"
        />
      </slot>
    </component>
  </div>
</template>
