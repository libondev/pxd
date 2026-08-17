<script lang="ts" setup>
import type { TextareaEmits, TextareaProps } from './types'
import { computed, shallowRef } from 'vue'
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
  trimOverflow: false,
})

const emits = defineEmits<TextareaEmits>()

const uniqueId = getUniqueId()

const modelValue = useModelValue(props, emits)

const configProvider = useConfigProvider()
const isComposing = shallowRef(false)

const wordCount = computed(() => String(modelValue.value ?? '').length)

const isWordLimitShown = computed(() => isTruthyProp(props.showWordLimit))
const hasMaxlength = computed(() => props.maxlength != null && props.maxlength !== '')
const isWordLimitOutside = computed(() => props.wordLimitPosition === 'outside')
const nativeMaxlength = computed(() => (isComposing.value ? undefined : props.maxlength))

const nativeTextareaClasses = computed(() => ({
  'pbe-7': isWordLimitShown.value && isWordLimitOutside.value,
}))

const wordLimitClasses = computed(() => ({
  'top-full right-0 mbs-1': isWordLimitOutside.value,
  'bottom-1.5 right-3': !isWordLimitOutside.value,
  'text-red-900': isWordLimitExceeded.value,
}))

const wordLimitText = computed(() => {
  if (hasMaxlength.value) {
    return `${wordCount.value} / ${props.maxlength}`
  }

  return `${wordCount.value}`
})

const isWordLimitExceeded = computed(
  () => hasMaxlength.value && wordCount.value > Number(props.maxlength),
)

const { attrs, classes } = useTailwindVariant(
  {
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
      },
      readonly: {
        true: 'is-readonly',
      },
      error: {
        true: 'is-error',
      },
    },
  },
  {
    selection: () => ({
      size: props.size || configProvider.size,
      error: isTruthyProp(props.error) || isWordLimitExceeded.value,
      disabled: isTruthyProp(props.disabled),
      readonly: isTruthyProp(props.readonly),
    }),
  },
)

function onInputFocus(event: FocusEvent) {
  emits('focus', event)
}

function onInputBlur(event: FocusEvent) {
  emits('blur', event)
}

function onInputChange(event: Event) {
  emits('change', (event.target as HTMLTextAreaElement).value)
}

function trimTextareaValue(textareaValue: string) {
  if (props.trimOverflow && hasMaxlength.value) {
    return textareaValue.slice(0, Number(props.maxlength))
  }

  return textareaValue
}

function onCompositionStart() {
  isComposing.value = true
}

function onCompositionUpdate() {
  isComposing.value = true
}

function onCompositionEnd(event: CompositionEvent) {
  isComposing.value = false

  const target = event.target as HTMLTextAreaElement
  const textareaValue = trimTextareaValue(target.value)

  if (textareaValue !== target.value) {
    target.value = textareaValue
    modelValue.value = textareaValue
  }
}
</script>

<template>
  <label :for="uniqueId" :class="classes" v-bind="attrs">
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
      :maxlength="nativeMaxlength"
      :placeholder="placeholder"
      @change="onInputChange"
      @focus="onInputFocus"
      @blur="onInputBlur"
      @compositionstart="onCompositionStart"
      @compositionupdate="onCompositionUpdate"
      @compositionend="onCompositionEnd"
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
