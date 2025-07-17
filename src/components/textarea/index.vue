<script setup lang="ts">
import type { ComponentLabel, ComponentSizeWithXs } from '../../types/components'
import { computed } from 'vue'
import { useConfigProviderSize } from '../../composables/useConfigProviderContext'
import { useModelValue } from '../../composables/useModelValue'
import { getUniqueId } from '../../utils/uid'
import PError from '../error/index.vue'

interface Props {
  size?: ComponentSizeWithXs
  error?: string
  label?: ComponentLabel
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  autofocus?: boolean
  minlength?: number | string
  maxlength?: number | string
  modelValue?: ComponentLabel
  placeholder?: string
}

defineOptions({
  name: 'PTextarea',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: '',
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'change': [Event]
}>()

const uniqueId = getUniqueId()

const SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

const modelValue = useModelValue(props, emits)

const computedSize = useConfigProviderSize(props.size, SIZES)

const computedClass = computed(() => {
  const classes = ['pxd-input--border flex items-center justify-center h-full min-h-[inherit] motion-safe:transition-all overflow-hidden rounded-md bg-background']

  classes.push(computedSize.value)

  if (props.disabled) {
    classes.push('is-disabled')
  }

  if (props.readonly) {
    classes.push('is-readonly')
  }

  if (props.error) {
    classes.push('is-error')
  }

  return classes.join(' ')
})

function onInputFocus(event: FocusEvent) {
  emits('focus', event)
}

function onInputBlur(event: FocusEvent) {
  emits('blur', event)
}

function onInputChange(event: Event) {
  emits('change', event)
}
</script>

<template>
  <label class="pxd-textarea block w-full max-w-full" :for="uniqueId">
    <div v-if="label || $slots.label" class="pxd-form--label">
      <slot name="label">{{ label }}</slot>
    </div>

    <div :class="computedClass">
      <textarea
        :id="uniqueId"
        v-model="modelValue"
        class="w-full h-full min-h-[inherit] py-2.5 px-3 rounded-inherit outline-none bg-transparent resize-none disabled:text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:placeholder:text-gray-400 placeholder:select-none placeholder:text-gray-600"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :autofocus="autofocus"
        :minlength="minlength"
        :maxlength="maxlength"
        :placeholder="placeholder"
        @change="onInputChange"
        @focus="onInputFocus"
        @blur="onInputBlur"
      />
    </div>

    <PError v-if="error" class="mt-1.5" :size="size">
      {{ error }}
    </PError>
  </label>
</template>
