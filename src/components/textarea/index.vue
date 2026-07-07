<script lang="ts" setup>
import type { TextareaEmits, TextareaProps } from './types'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { useConfigProvider } from '../../contexts/config-provider'
import { isTruthyProp } from '../../utils/format'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PTextarea',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: '',
  wordLimitPosition: 'inside',
})

const emits = defineEmits<TextareaEmits>()

const { attrs, classes: textareaClasses } = useTailwindVariant({
  base: 'pxd-textarea pxd-input--border relative flex size-full min-h-inherit max-w-full items-center justify-center rounded-md bg-background-100 motion-safe:transition-appearance',
  variants: {
    size: {
      xs: 'text-xs',
      sm: 'text-sm',
      md: 'text-sm',
      lg: 'text-base',
    },
    disabled: {
      true: 'is-disabled',
      false: '',
    },
    readonly: {
      true: 'is-readonly',
      false: '',
    },
    error: {
      true: 'is-error',
      false: '',
    },
  },
})

const uniqueId = getUniqueId()

const modelValue = useModelValue(props, emits)

const configProvider = useConfigProvider()

const computedClasses = computed(() => {
  return textareaClasses({
    size: props.size || configProvider.size,
    error: isTruthyProp(props.error),
    disabled: isTruthyProp(props.disabled),
    readonly: isTruthyProp(props.readonly),
  })
})

const wordCount = computed(() => String(modelValue.value ?? '').length)

const isWordLimitShown = computed(() => isTruthyProp(props.showWordLimit))
const hasMaxlength = computed(() => props.maxlength != null && props.maxlength !== '')
const isWordLimitInside = computed(() => props.wordLimitPosition === 'inside')

const nativeTextareaClasses = computed(() => ({
  'pb-7': isWordLimitShown.value && isWordLimitInside.value,
}))

const wordLimitClasses = computed(() => {
  return isWordLimitInside.value ? 'bottom-1.5 right-3' : 'top-full right-0 mt-1'
})

const wordLimitText = computed(() => {
  if (hasMaxlength.value) {
    return `${wordCount.value} / ${props.maxlength}`
  }

  return `${wordCount.value}`
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
  <label :for="uniqueId" :class="computedClasses" v-bind="attrs">
    <textarea
      :id="uniqueId"
      v-model="modelValue"
      class="py-2.5 px-3 size-full min-h-inherit resize-none appearance-none rounded-inherit border-none bg-transparent font-inherit outline-none placeholder:text-gray-600 placeholder:select-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:placeholder:text-gray-400"
      :class="nativeTextareaClasses"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
      :rows="rows"
      :cols="cols"
      :readonly="readonly"
      :disabled="disabled"
      :autofocus="autofocus"
      :minlength="minlength"
      :maxlength="maxlength"
      :placeholder="placeholder"
      @change="onInputChange"
      @focus="onInputFocus"
      @blur="onInputBlur"
    />
    <span
      v-if="isWordLimitShown"
      class="pxd-textarea--word-limit text-xs pointer-events-none absolute text-foreground-secondary select-none"
      :class="wordLimitClasses"
    >
      {{ wordLimitText }}
    </span>
  </label>
</template>
