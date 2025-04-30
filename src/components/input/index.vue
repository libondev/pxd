<script lang="ts" setup>
import type { ComponentSizeWithXs } from '../../types/components'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import PError from '../error/index.vue'

interface Props {
  size?: ComponentSizeWithXs
  error?: string
  readonly?: boolean
  disabled?: boolean
  modelValue?: string
  placeholder?: string
  prefixStyle?: boolean
  suffixStyle?: boolean
  minlength?: number | string
  maxlength?: number | string
}

defineOptions({
  name: 'PInput',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    modelValue: '',
    prefixStyle: true,
    suffixStyle: true,
  },
)

const emits = defineEmits<{
  'update:modelValue': [string]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'change': [Event]
}>()

const config = useConfigProvider()

const SIZES = {
  xs: 'h-6 text-xs',
  sm: 'h-7.5 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10.5 text-base',
}

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('update:modelValue', value)
  },
})

const computedClasses = computed(() => {
  const basic = ['pxd-input--container flex items-center justify-center rounded-inherit h-full motion-safe:transition-all overflow-hidden rounded-md bg-background']

  basic.push(SIZES[props.size || config.size])

  if (props.disabled) {
    basic.push('is-disabled bg-gray-100')
  }

  if (props.readonly) {
    basic.push('is-readonly')
  }

  if (props.error) {
    basic.push('is-error')
  }

  return twMerge(basic)
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
  <div class="pxd-input max-w-full">
    <label :class="computedClasses">
      <div
        v-if="$slots.prefix"
        aria-hidden="true"
        class="pl-3 h-full flex items-center text-sm text-gray-700 "
        :class="{ 'bg-background-secondary rounded-tl-inherit rounded-bl-inherit border-r pr-3': prefixStyle }"
      >
        <slot name="prefix" />
      </div>

      <input
        v-model="modelValue"
        class="w-full h-full px-3 rounded-inherit outline-none bg-transparent disabled:text-gray-700 disabled:cursor-not-allowed placeholder:select-none file:border-0 file:bg-transparent file:font-medium"
        :readonly="readonly"
        :disabled="disabled"
        :placeholder="placeholder"
        autocapitalize="off"
        autocomplete="off"
        autocorrect="off"
        :minlength="minlength"
        :maxlength="maxlength"
        v-bind="$attrs"
        @change="onInputChange"
        @focus="onInputFocus"
        @blur="onInputBlur"
      >

      <div
        v-if="$slots.suffix"
        aria-hidden="true"
        class="pr-3 h-full flex items-center text-sm text-gray-700"
        :class="{ 'bg-background-secondary rounded-tr-inherit rounded-br-inherit border-l pl-3': suffixStyle }"
      >
        <slot name="suffix" />
      </div>
    </label>

    <PError v-if="error" class="mt-1.5" :size="size">
      {{ error }}
    </PError>
  </div>
</template>

<style lang="postcss">
.pxd-input--container {
  box-shadow: 0 0 0 1px var(--border-color, var(--gray-alpha-300));

  &:not(.is-disabled, .is-readonly):hover {
    --border-color: var(--gray-alpha-600);
  }

  &:not(.is-disabled, .is-readonly):focus-within {
    box-shadow: 0 0 0 1px var(--gray-alpha-600), 0 0 0 4px var(--gray-alpha-300);
  }

  &.is-error {
    &, &:focus-within {
      box-shadow: 0 0 0 1px hsl(var(--red-900-value)), 0 0 0 4px hsl(var(--red-300-value));
    }

    &:not(.is-disabled, .is-readonly, :focus):hover {
      box-shadow: 0 0 0 1px hsl(var(--red-900-value)), 0 0 0 4px hsl(var(--red-500-value));
    }
  }
}
</style>
