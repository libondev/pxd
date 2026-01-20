<script setup lang="ts">
import type { ComponentLabel, ComponentSizeWithXs } from '../../types/shared'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useModelValue } from '../../composables/use-model-value'
import { getFallbackValue } from '../../utils/get'
import { getUniqueId } from '../../utils/uid'

interface Props {
  size?: ComponentSizeWithXs
  error?: boolean | string
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
  'change': [NonNullable<Props['modelValue']>]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
}>()

const uniqueId = getUniqueId()

const SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

const modelValue = useModelValue(props, emits)

const config = useConfigProvider()

const computedClass = computed(() => {
  const classes = []

  classes.push(getFallbackValue(props.size, SIZES, config.size))

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
  emits('change', (event.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <label
    :for="uniqueId"
    class="pxd-textarea pxd-input--border flex size-full min-h-[inherit] max-w-full items-center justify-center overflow-hidden rounded-md bg-background-100 motion-safe:transition-all"
    :class="computedClass"
  >
    <textarea
      :id="uniqueId"
      v-model="modelValue"
      class="py-2.5 px-3 size-full min-h-[inherit] resize-none appearance-none rounded-inherit border-none bg-transparent font-inherit outline-none placeholder:text-gray-600 placeholder:select-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:placeholder:text-gray-400"
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
  </label>
</template>
