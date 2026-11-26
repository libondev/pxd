<script lang="ts" setup>
import type { InputEmits, InputProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import EyeIcon from '@gdsicon/vue/eye'
import EyeOffIcon from '@gdsicon/vue/eye-off'
import { computed, shallowRef } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useFormControl } from '../../composables/_internal/use-form-control.js'
import { useModelCommit } from '../../composables/_internal/use-model-commit.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { useWordLimit } from '../../composables/_internal/use-word-limit.js'
import { BASIC_HEIGHTS, SIZE_TEXT_CLASS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { NOOP, isCompositionKeydown } from '../../utils/event.js'
import { getUniqueId } from '../../utils/helper.js'
import { isNil } from '../../utils/is.js'

defineOptions({
  name: 'PInput',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<InputProps>(), {
  align: 'left',
  trimOverflow: false,
  wordLimitPosition: 'inside',
  clearOnPressEscape: false,
  defaultPrefixStyle: true,
  defaultSuffixStyle: true,
})

const emits = defineEmits<InputEmits>()

const uniqueId = getUniqueId()

const rootRef = shallowRef<HTMLElement>()
const inputRef = shallowRef<HTMLInputElement>()
const isComposing = shallowRef(false)
const isPasswordVisible = shallowRef(!props.password)
const inputType = computed(() => {
  if (props.inputType) {
    return props.inputType
  }

  return isPasswordVisible.value ? 'text' : 'password'
})

const {
  id: controlId,
  invalid: isInvalid,
  disabled: isDisabled,
  readonly: isReadonly,
  required: isRequired,
  size: controlSize,
  describedBy,
} = useFormControl({
  id: () => props.id,
  fallbackId: uniqueId,
  invalid: () => props.invalid,
  disabled: () => props.disabled,
  readonly: () => props.readonly,
  required: () => props.required,
  size: () => props.size,
})

const configProvider = useConfigProvider()
const { modelValue, commit } = useModelCommit(props, emits)
const {
  isWordLimitShown,
  hasMaxLength,
  isWordLimitOutside,
  nativeMaxLength,
  wordLimitText,
  isWordLimitExceeded,
} = useWordLimit({
  modelValue,
  showWordLimit: () => props.showWordLimit,
  maxLength: () => props.maxLength,
  wordLimitPosition: () => props.wordLimitPosition,
  isComposing,
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-input pxd-input--border group relative flex w-full max-w-full items-center bg-background-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-gray-100 motion-safe:transition-appearance',
    variants: {
      size: {
        xs: `${BASIC_HEIGHTS.xs} ${SIZE_TEXT_CLASS.xs} rounded-sm [--input-ip:0.375rem]`,
        sm: `${BASIC_HEIGHTS.sm} ${SIZE_TEXT_CLASS.sm} rounded-md [--input-ip:0.5rem]`,
        md: `${BASIC_HEIGHTS.md} ${SIZE_TEXT_CLASS.md} rounded-md [--input-ip:0.75rem]`,
        lg: `${BASIC_HEIGHTS.lg} ${SIZE_TEXT_CLASS.lg} rounded-lg [--input-ip:0.75rem]`,
      },
      align: {
        left: 'text-left',
        center: 'text-center',
        right: 'text-right',
      },
      disabled: {
        true: 'is-disabled',
      },
      readonly: {
        true: 'is-readonly',
      },
      invalid: {
        true: 'is-error',
      },
    },
  },
  {
    selection: () => ({
      size: controlSize.value || configProvider.size,
      align: props.align,
      invalid: isInvalid.value || isWordLimitExceeded.value,
      disabled: isDisabled.value ?? false,
      readonly: isReadonly.value ?? false,
    }),
  },
)

useAgentNode({
  name: 'input',
  el: () => rootRef.value,
  state: () => ({
    value: modelValue.value ?? '',
    disabled: isDisabled.value ?? false,
    readonly: isReadonly.value ?? false,
    ...(isRequired.value && { required: true }),
    placeholder: props.placeholder,
  }),
  actions: {
    setValue: (value) => {
      const next = value == null ? '' : String(value)

      modelValue.value = next
      commit(next, { reason: 'api' })
    },
    focus,
    blur,
    select,
  },
})

function getInputValue(ev: Event) {
  return (ev.target as HTMLInputElement).value
}

function trimInputValue(inputValue: string) {
  if (props.trimOverflow && hasMaxLength.value) {
    return inputValue.slice(0, Number(props.maxLength))
  }

  return inputValue
}

function onFocus(event: FocusEvent) {
  if (props.selectOnFocus) {
    inputRef.value?.select()
  }

  emits('focus', event)
}

function onBlur(event: FocusEvent) {
  emits('blur', event)
}

function onClick(event: MouseEvent) {
  emits('click', event)
}

function onChange(event: Event) {
  const inputValue = getInputValue(event)
  commit(inputValue, { reason: 'typed', event })
}

function onInput(event: Event) {
  const ev = event as InputEvent

  if (ev.isComposing || isComposing.value) {
    return
  }

  const inputValue = getInputValue(event)
  modelValue.value = inputValue
}

function onKeydown(event: KeyboardEvent) {
  if (isReadonly.value || isDisabled.value) {
    return
  }

  if (!isCompositionKeydown(event)) {
    if (event.key === 'Enter') {
      onChange(event)
    } else if (event.key === 'Escape' && props.clearOnPressEscape) {
      const hasValue = !isNil(modelValue.value) && modelValue.value !== ''

      clear()

      if (hasValue) {
        event.preventDefault()
      }
    }
  }

  emits('keydown', event)
}

function onCompositionStart(event: CompositionEvent) {
  isComposing.value = true
  emits('compositionstart', event)
}

function onCompositionUpdate(event: CompositionEvent) {
  isComposing.value = true
  emits('compositionupdate', event)
}

function onCompositionEnd(event: CompositionEvent) {
  isComposing.value = false
  emits('compositionend', event)

  const target = event.target as HTMLInputElement
  const inputValue = trimInputValue(getInputValue(event))
  target.value = inputValue
  modelValue.value = inputValue
}

function toggleType() {
  isPasswordVisible.value = !isPasswordVisible.value
}

function blur() {
  inputRef.value?.blur()
}

function focus() {
  inputRef.value?.focus()
}

function select() {
  inputRef.value?.select()
}

function clear() {
  const clearValue = props.clearValue ?? ''

  commit('', { reason: 'cleared' })
  modelValue.value = clearValue
}

defineExpose({
  input: inputRef,
  blur,
  clear,
  focus,
  select,
})
</script>

<template>
  <label
    ref="rootRef"
    data-input
    :for="controlId"
    :data-disabled="isDisabled"
    :class="classes"
    v-bind="attrs"
    @click="onClick"
    @dragstart.prevent="NOOP"
  >
    <div
      v-if="$slots.prefix"
      class="pxd-input--prefix text-sm flex h-full shrink-0 items-center rounded-l-inherit text-foreground-secondary"
      :class="[
        { 'border-r border-gray-300 bg-background-200 px-(--input-ip)': defaultPrefixStyle },
        prefixClass,
      ]"
      @pointerdown.prevent="NOOP"
    >
      <slot name="prefix" />
    </div>

    <input
      :id="controlId"
      ref="inputRef"
      class="py-0 file:font-medium size-full appearance-none truncate rounded-none border-none bg-transparent px-(--input-ip) [text-align:inherit] font-inherit outline-none select-auto file:border-0 file:bg-transparent placeholder:text-gray-600 placeholder:select-none read-only:cursor-default disabled:cursor-not-allowed disabled:text-gray-700 disabled:placeholder:text-gray-500"
      spellcheck="false"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
      :min="min"
      :max="max"
      :type="inputType"
      :value="modelValue"
      :readonly="isReadonly"
      :disabled="isDisabled"
      :required="isRequired"
      :inputmode="inputMode"
      :minlength="minLength"
      :maxlength="nativeMaxLength"
      :autofocus="autofocus"
      :aria-disabled="isDisabled"
      :aria-invalid="isInvalid || undefined"
      :aria-describedby="describedBy || undefined"
      :placeholder="placeholder"
      v-bind="inputAttrs"
      @blur="onBlur"
      @focus="onFocus"
      @input="onInput"
      @change="onChange"
      @keydown="onKeydown"
      @compositionstart="onCompositionStart"
      @compositionupdate="onCompositionUpdate"
      @compositionend="onCompositionEnd"
    />

    <div
      v-if="password || clearable"
      v-show="modelValue"
      :class="{ 'pe-2': password && clearable }"
      class="pxd-input--icon top-0 right-0 pe-2 gap-1 flex h-full items-center justify-center rounded-r-inherit text-foreground-secondary"
      @pointerdown.prevent="NOOP"
    >
      <button
        v-if="password"
        type="button"
        class="p-1 cursor-pointer appearance-none rounded-sm font-inherit self-focus-ring outline-none hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors"
        @click.stop.prevent="toggleType"
      >
        <EyeOffIcon v-if="isPasswordVisible" class="size-3" />
        <EyeIcon v-else class="size-3" />
      </button>
      <button
        v-if="clearable"
        type="button"
        data-popover-ignore
        :aria-label="configProvider.locale.interaction.clear"
        class="pxd-input--clear p-1 cursor-pointer appearance-none rounded-sm font-inherit self-focus-ring outline-none hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors"
        @click.stop.prevent="clear"
      >
        <CrossIcon class="size-3" />
      </button>
    </div>

    <span
      v-if="isWordLimitShown"
      class="pxd-input--word-limit text-xs px-1.5 -ms-1.5 shrink-0 text-nowrap text-foreground-secondary"
      :class="{
        'right-0 pe-0 mbs-1 absolute top-full': isWordLimitOutside,
        'text-red-900': isWordLimitExceeded,
      }"
    >
      {{ wordLimitText }}
    </span>

    <div
      v-if="$slots.suffix"
      class="pxd-input--suffix text-sm flex h-full shrink-0 items-center rounded-r-inherit text-foreground-secondary"
      :class="[
        {
          'rounded-r-inherit border-l border-gray-300 bg-background-200 px-(--input-ip)':
            defaultSuffixStyle,
        },
        suffixClass,
      ]"
      @pointerdown.prevent="NOOP"
    >
      <slot name="suffix" />
    </div>
  </label>
</template>

<style>
input:-webkit-autofill,
input:-webkit-autofill:hover,
input:-webkit-autofill:focus,
input:-webkit-autofill:active {
  --autofill-delay: calc(infinity * 1s);
  transition:
    background-color var(--autofill-delay) var(--default-transition-duration) 0s,
    color var(--autofill-delay) var(--default-transition-duration) 0s;
}
</style>
