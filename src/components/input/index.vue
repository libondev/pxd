<script lang="ts" setup>
import type { InputProps } from '../../types/components/input'
import CrossIcon from '@gdsicon/vue/cross'
import EyeIcon from '@gdsicon/vue/eye'
import EyeOffIcon from '@gdsicon/vue/eye-off'
import { computed, nextTick, onMounted, shallowRef, watch } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useModelValue } from '../../composables/use-model-value'
import { isTruthyProp } from '../../utils/format'
import { getFallbackValue } from '../../utils/get'
import { getUniqueId } from '../../utils/uid'
import PError from '../error/index.vue'

defineOptions({
  name: 'PInput',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<InputProps>(),
  {
    align: 'left',
    modelValue: '',
    prefixStyle: true,
    suffixStyle: true,
  },
)

const emits = defineEmits<{
  'update:modelValue': [string]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'change': [InputProps['modelValue']]
  'keydown': [KeyboardEvent]
  'input': [InputProps['modelValue']]
  'compositionstart': [CompositionEvent]
  'compositionupdate': [CompositionEvent]
  'compositionend': [CompositionEvent]
}>()

const SIZES = {
  xs: 'h-6 text-xs',
  sm: 'h-7.5 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10 text-base',
}

const ALIGN = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
}

const uniqueId = getUniqueId()
const inputRef = shallowRef<HTMLInputElement>()

const config = useConfigProvider()
const computedModelValue = useModelValue(props, emits)

const isComposing = shallowRef(false)
const isPasswordVisible = shallowRef(!props.password)
const internalInputType = computed(() => props.inputType || isPasswordVisible.value ? 'text' : 'password')

const computedClass = computed(() => {
  const classes = ['pxd-input--border group relative flex items-center overflow-hidden rounded-md bg-background-100 data-[disabled=true]:cursor-not-allowed data-[disabled=true]:bg-gray-100 motion-safe:transition-all']

  classes.push(getFallbackValue(props.size, SIZES, config.size))

  if (isTruthyProp(props.disabled)) {
    classes.push('is-disabled')
  }

  if (isTruthyProp(props.readonly)) {
    classes.push('is-readonly')
  }

  if (props.error) {
    classes.push('is-error')
  }

  return classes.join(' ')
})

function getValueFromEvent(ev: Event) {
  let { value } = ev.target as HTMLInputElement

  if (props.parser) {
    value = props.parser(value)
  }

  return value
}

function getFormattedValue(value: InputProps['modelValue']) {
  return typeof props.formatter === 'function'
    ? props.formatter(value)
    : value
}

function setNativeInputValue(value: any) {
  const input = inputRef.value

  const formatterValue = getFormattedValue(value)

  if (input == null || input.value === formatterValue) {
    return
  }

  input.value = formatterValue
}

function onFocus(event: FocusEvent) {
  emits('focus', event)
}

function onBlur(event: FocusEvent) {
  emits('blur', event)
}

async function onInput(event: Event) {
  const ev = event as InputEvent

  if (ev.isComposing || isComposing.value) {
    return
  }

  const value = getValueFromEvent(event)
  computedModelValue.value = value

  emits('input', value)

  if (value !== computedModelValue.value) {
    emits('change', value)
  }

  await nextTick()
  setNativeInputValue(value)
}

function onKeydown(event: KeyboardEvent) {
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
  if (isComposing.value) {
    const value = getValueFromEvent(event)
    computedModelValue.value = value
  }

  emits('compositionend', event)

  await nextTick()
  setNativeInputValue(getValueFromEvent(event))
}

function toggleType() {
  isPasswordVisible.value = !isPasswordVisible.value
}

function clearValue() {
  computedModelValue.value = ''
}

const blur = () => inputRef.value?.blur()
const focus = () => inputRef.value?.focus()
const select = () => inputRef.value?.select()

watch(() => props.modelValue, (value) => {
  setNativeInputValue(getFormattedValue(value))
})

onMounted(async () => {
  await nextTick()

  setNativeInputValue(getFormattedValue(computedModelValue.value))
})

defineExpose({
  blur,
  focus,
  select,
  clear: clearValue,
})
</script>

<template>
  <label class="pxd-input block w-full max-w-full" :for="uniqueId" @dragstart.prevent>
    <div v-if="label || $slots.label" class="pxd-form--label">
      <slot name="label">{{ label }}</slot>
    </div>

    <div :data-disabled="disabled" :class="computedClass">
      <div
        v-if="$slots.prefix"
        class="pxd-input--prefix text-sm flex h-full items-center text-gray-700"
        :class="{ 'px-3 rounded-l-inherit border-r border-gray-300 bg-background-200': prefixStyle }"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="uniqueId"
        ref="inputRef"
        class="px-3 size-full rounded-inherit bg-transparent outline-none file:font-medium file:border-0 file:bg-transparent placeholder:text-gray-600 placeholder:select-none disabled:cursor-not-allowed disabled:text-gray-700 disabled:placeholder:text-gray-500"
        :class="{ 'pr-9': password || allowClear, [ALIGN[align]]: true }"
        :type="internalInputType"
        :min="min"
        :max="max"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :inputmode="inputmode"
        :minlength="minlength"
        :maxlength="maxlength"
        :autofocus="autofocus"
        :placeholder="placeholder"
        :aria-disabled="disabled"
        :data-value="computedModelValue"
        @blur="onBlur"
        @focus="onFocus"
        @input="onInput"
        @keydown="onKeydown"
        @compositionstart="onCompositionStart"
        @compositionupdate="onCompositionUpdate"
        @compositionend="onCompositionEnd"
      >

      <div
        v-if="password || allowClear"
        v-show="computedModelValue"
        class="pxd-input--icon right-0 top-0 flex aspect-square h-full cursor-pointer items-center justify-center rounded-r-inherit text-foreground-secondary"
      >
        <div v-if="password" class="p-1 rounded-sm hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors" @click.prevent="toggleType">
          <EyeOffIcon v-if="isPasswordVisible" class="size-3" />
          <EyeIcon v-else class="size-3" />
        </div>
        <div v-if="allowClear" class="p-1 rounded-sm hover:bg-background-hover hover:text-foreground active:bg-background-active motion-safe:transition-colors" @click.prevent="clearValue">
          <CrossIcon class="size-3" />
        </div>
      </div>

      <div
        v-if="$slots.suffix"
        class="pxd-input--suffix text-sm flex h-full items-center text-gray-700"
        :class="{ 'px-3 rounded-r-inherit border-l border-gray-300 bg-background-200': suffixStyle }"
      >
        <slot name="suffix" />
      </div>
    </div>

    <PError v-if="error" class="mt-2" :size="size">
      {{ error }}
    </PError>
  </label>
</template>

<style>
.pxd-input:has(.pxd-input--prefix) input {
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

.pxd-input:has(.pxd-input--suffix) input {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
