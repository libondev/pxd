<script lang="ts" setup>
import type { InputEmits, InputProps } from './types'
import CrossIcon from '@gdsicon/vue/cross'
import EyeIcon from '@gdsicon/vue/eye'
import EyeOffIcon from '@gdsicon/vue/eye-off'
import { tv } from 'tailwind-variants'
import { computed, shallowRef } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { BASIC_HEIGHTS } from '../../constants/size'
import { useConfigProvider } from '../../contexts/config-provider'
import { NOOP } from '../../utils/event'
import { isTruthyProp } from '../../utils/format'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PInput',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<InputProps>(), {
  align: 'left',
  defaultPrefixStyle: true,
  defaultSuffixStyle: true,
})

const emits = defineEmits<InputEmits>()

const inputVariant = tv({
  base: 'pxd-input pxd-input--border group relative flex w-full max-w-full items-center overflow-hidden bg-background-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-gray-100 motion-safe:transition-all',
  variants: {
    size: {
      xs: `${BASIC_HEIGHTS.xs} text-sm rounded-sm`,
      sm: `${BASIC_HEIGHTS.sm} text-sm rounded-md`,
      md: `${BASIC_HEIGHTS.md} text-sm rounded-md`,
      lg: `${BASIC_HEIGHTS.lg} text-base rounded-lg`,
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
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
  defaultVariants: {
    size: 'md',
    align: 'left',
    disabled: false,
    readonly: false,
    error: false,
  },
})

const uniqueId = getUniqueId()
const inputRef = shallowRef<HTMLInputElement>()

const configProvider = useConfigProvider()
const modelValue = useModelValue(props, emits, { withChange: false })

const isComposing = shallowRef(false)
const isPasswordVisible = shallowRef(!props.password)
const inputType = computed(() => (props.inputType || isPasswordVisible.value ? 'text' : 'password'))

const computedClasses = computed(() => {
  return inputVariant({
    size: props.size || configProvider.size,
    align: props.align,
    error: isTruthyProp(props.error),
    disabled: isTruthyProp(props.disabled),
    readonly: isTruthyProp(props.readonly),
  })
})

function getInputValue(ev: Event) {
  return (ev.target as HTMLInputElement).value
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
  emits('change', inputValue, event)
}

async function onInput(event: Event) {
  const ev = event as InputEvent

  if (ev.isComposing || isComposing.value) {
    return
  }

  const inputValue = getInputValue(event)
  modelValue.value = inputValue

  emits('input', inputValue)
}

function onKeydown(event: KeyboardEvent) {
  if (props.readonly) {
    return
  }

  if (event.key === 'Enter') {
    onChange(event)
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

async function onCompositionEnd(event: CompositionEvent) {
  isComposing.value = false
  emits('compositionend', event)

  const inputValue = getInputValue(event)
  modelValue.value = inputValue

  emits('input', inputValue)
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

function clear(ev: Event) {
  const clearValue = props.clearValue ?? ''

  emits('input', '')
  emits('change', '', ev)
  modelValue.value = clearValue
}

defineExpose({
  blur,
  clear,
  focus,
  select,
})
</script>

<template>
  <label
    :for="uniqueId"
    :data-disabled="disabled"
    :class="computedClasses"
    v-bind="$attrs"
    @click="onClick"
    @dragstart.prevent="NOOP"
  >
    <div
      v-if="$slots.prefix"
      class="pxd-input--prefix text-sm flex h-full items-center text-foreground-secondary"
      :class="[
        { 'px-3 rounded-l-inherit border-r border-gray-300 bg-background-200': defaultPrefixStyle },
        prefixClass,
      ]"
      @pointerdown.prevent="NOOP"
    >
      <slot name="prefix" />
    </div>

    <input
      :id="uniqueId"
      ref="inputRef"
      class="px-3 py-0 file:font-medium size-full appearance-none rounded-none border-none bg-transparent [text-align:inherit] font-inherit outline-none select-auto file:border-0 file:bg-transparent placeholder:text-gray-600 placeholder:select-none read-only:cursor-default disabled:cursor-not-allowed disabled:text-gray-700 disabled:placeholder:text-gray-500"
      autocorrect="off"
      autocomplete="off"
      autocapitalize="off"
      :min="min"
      :max="max"
      :type="inputType"
      :value="modelValue"
      :readonly="readonly"
      :disabled="disabled"
      :inputmode="inputmode"
      :minlength="minlength"
      :maxlength="maxlength"
      :autofocus="autofocus"
      :aria-disabled="disabled"
      :placeholder="placeholder"
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
      :class="{ 'pr-2': password && clearable }"
      class="pxd-input--icon top-0 right-0 gap-1 flex aspect-square h-full items-center justify-center rounded-r-inherit text-foreground-secondary"
      @pointerdown.prevent="NOOP"
    >
      <button
        v-if="password"
        class="p-1 cursor-pointer appearance-none rounded-sm font-inherit self-focus-ring outline-none hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors"
        @click.stop.prevent="toggleType"
      >
        <EyeOffIcon v-if="isPasswordVisible" class="size-3 pointer-events-none" />
        <EyeIcon v-else class="size-3 pointer-events-none" />
      </button>
      <button
        v-if="clearable"
        class="p-1 cursor-pointer appearance-none rounded-sm font-inherit self-focus-ring outline-none hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors"
        @click.stop.prevent="clear"
      >
        <CrossIcon class="size-3 pointer-events-none" />
      </button>
    </div>

    <div
      v-if="$slots.suffix"
      class="pxd-input--suffix text-sm flex h-full items-center text-foreground-secondary"
      :class="[
        { 'px-3 rounded-r-inherit border-l border-gray-300 bg-background-200': defaultSuffixStyle },
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
    background-color var(--autofill-delay) ease-in-out 0s,
    color var(--autofill-delay) ease-in-out 0s;
}
</style>
