<script lang="ts" setup>
import type { ComponentSizeWithXs } from '../../types/components'
import { EyeIcon, EyeOffIcon } from 'gdsi/vue'
import { twMerge } from 'tailwind-merge'
import { computed, shallowRef } from 'vue'
import { useComputedSize } from '../../composables/useComputedSize'
import { useModelValue } from '../../composables/useModelValue'
import PError from '../error/index.vue'

interface Props {
  size?: ComponentSizeWithXs
  error?: string
  readonly?: boolean
  disabled?: boolean
  password?: boolean
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
  'update:modelValue': [Props['modelValue']]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'change': [Event]
}>()

const SIZES = {
  xs: 'h-6 text-xs',
  sm: 'h-7.5 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10.5 text-base',
}

const modelValue = useModelValue(props, emits)
const internalInputType = shallowRef(props.password ? 'password' : 'text')

const computedClasses = computed(() => {
  const basic = ['pxd-input--container relative flex items-center justify-center rounded-inherit h-full motion-safe:transition-all overflow-hidden rounded-md bg-background']

  basic.push(useComputedSize(props.size, SIZES))

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

function togglePasswordType() {
  internalInputType.value = internalInputType.value === 'password' ? 'text' : 'password'
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
        :class="{ 'pr-10': password }"
        :readonly="readonly"
        :disabled="disabled"
        :placeholder="placeholder"
        :type="internalInputType"
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

      <div v-if="password && modelValue" class="pxd-input--pw-icon absolute right-0 top-0 p-3 h-full text-gray-900 hover:text-gray-1000 motion-safe:transition-colors cursor-pointer flex items-center" @click.prevent="togglePasswordType">
        <EyeIcon v-if="internalInputType === 'password'" class="size-3" />
        <EyeOffIcon v-else class="size-3" />
      </div>

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
