<script lang="ts" setup>
import type { TextareaEmits, TextareaProps } from './types'
import { computed, shallowRef } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useModelCommit } from '../../composables/_internal/use-model-commit.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useWordLimit } from '../../composables/_internal/use-word-limit.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isTruthyProp } from '../../utils/format.js'
import { getUniqueId } from '../../utils/helper.js'

defineOptions({
  name: 'PTextarea',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<TextareaProps>(), {
  modelValue: '',
  wordLimitPosition: 'inside',
  trimOverflow: false,
})

const emits = defineEmits<TextareaEmits>()

const uniqueId = getUniqueId()

const isComposing = shallowRef(false)
const textareaRef = shallowRef<HTMLTextAreaElement>()

const { modelValue, commit } = useModelCommit(props, emits)

const configProvider = useConfigProvider()
const {
  isWordLimitShown,
  hasMaxLength,
  isWordLimitOutside,
  isWordLimitExceeded,
  wordLimitText,
  nativeMaxLength,
} = useWordLimit({
  modelValue,
  showWordLimit: () => props.showWordLimit,
  maxLength: () => props.maxLength,
  wordLimitPosition: () => props.wordLimitPosition,
  isComposing,
})

const nativeTextareaClasses = computed(() => ({
  'pbe-7': isWordLimitShown.value && isWordLimitOutside.value,
}))

const wordLimitClasses = computed(() => ({
  'top-full right-0 mbs-1': isWordLimitOutside.value,
  'bottom-1.5 right-3': !isWordLimitOutside.value,
  'text-red-900': isWordLimitExceeded.value,
}))

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-textarea pxd-input--border relative flex size-full min-h-inherit max-w-full items-center justify-center rounded-md bg-background-100 motion-safe:transition-appearance',
    variants: {
      size: {
        xs: 'text-xs [--input-bp:0.375rem] [--input-ip:0.375rem]',
        sm: 'text-sm [--input-bp:0.5rem] [--input-ip:0.5rem]',
        md: 'text-sm [--input-bp:0.625rem] [--input-ip:0.75rem]',
        lg: 'text-base [--input-bp:0.625rem] [--input-ip:0.75rem]',
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
useAgentNode({
  name: 'textarea',
  state: () => ({
    value: modelValue.value ?? '',
    disabled: props.disabled ?? false,
    readonly: props.readonly ?? false,
    ...(props.required && { required: true }),
  }),
  actions: {
    setValue: (value) => {
      const next = value == null ? '' : String(value)

      modelValue.value = next
      commit(next, { reason: 'api' })
    },
    focus: () => textareaRef.value?.focus(),
    blur: () => textareaRef.value?.blur(),
  },
})

function onInputFocus(event: FocusEvent) {
  emits('focus', event)
}

function onInputBlur(event: FocusEvent) {
  emits('blur', event)
}
function onInputChange(event: Event) {
  commit((event.target as HTMLTextAreaElement).value, { reason: 'typed', event })
}

function trimTextareaValue(textareaValue: string) {
  if (props.trimOverflow && hasMaxLength.value) {
    return textareaValue.slice(0, Number(props.maxLength))
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
  <label data-textarea :for="uniqueId" :class="classes" v-bind="attrs">
    <textarea
      ref="textareaRef"
      :id="uniqueId"
      v-model="modelValue"
      class="size-full min-h-inherit resize-none appearance-none rounded-inherit border-none bg-transparent px-(--input-ip) py-(--input-bp) font-inherit outline-none placeholder:text-gray-600 placeholder:select-none disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:placeholder:text-gray-400"
      :class="nativeTextareaClasses"
      spellcheck="false"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
      :rows="rows"
      :cols="cols"
      :readonly="readonly"
      :disabled="disabled"
      :required="required"
      :autofocus="autofocus"
      :minlength="minLength"
      :maxlength="nativeMaxLength"
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
