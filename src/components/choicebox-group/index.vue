<script lang="ts" setup>
import type { ChoiceboxGroupProps } from '../../types/components/choicebox'
import { computed, markRaw, useAttrs } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { provideChoiceboxGroupContext, provideChoiceboxGroupModelValue } from '../../contexts/choicebox'
import PCheckboxGroup from '../checkbox-group/index.vue'
import PRadioGroup from '../radio-group/index.vue'

defineOptions({
  name: 'PChoiceboxGroup',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<ChoiceboxGroupProps>(),
  {
    type: 'radio',
    required: false,
    disabled: false,
    modelValue: '',
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<ChoiceboxGroupProps['modelValue']>]
}>()

const attrs = useAttrs()

const modelValue = useModelValue(props, emits) as any

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

provideChoiceboxGroupContext(props)
provideChoiceboxGroupModelValue(modelValue)
</script>

<template>
  <div class="pxd-choicebox-group w-full">
    <div v-if="label || $slots.label" class="pxd-form--label">
      <slot name="label">
        {{ label }}
      </slot>
    </div>

    <Component
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
