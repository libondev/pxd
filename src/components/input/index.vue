<script lang="ts" setup>
import type { ComponentSize } from '../../types/components'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import PError from '../error/index.vue'

interface Props {
  size?: ComponentSize | 'xs'
  error?: string
  readonly?: boolean
  disabled?: boolean
  placeholder?: string
  prefixStyle?: boolean
  suffixStyle?: boolean
}

defineOptions({
  name: 'PInput',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    prefixStyle: true,
    suffixStyle: true,
  },
)
const config = useConfigProvider()

const SIZES = {
  xs: 'h-6 text-xs',
  sm: 'h-7.5 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10.5 text-base',
}

const computedClasses = computed(() => {
  const basic = ['pxd-input motion-safe:transition-all rounded-md bg-background']

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
</script>

<template>
  <div :class="computedClasses">
    <label class="flex items-center justify-center rounded-inherit h-full">
      <div
        v-if="$slots.prefix"
        aria-hidden="true"
        class="pl-3 h-full flex items-center text-sm text-gray-700 "
        :class="{ 'bg-background-secondary rounded-tl-inherit rounded-bl-inherit border-r pr-3': prefixStyle }"
      >
        <slot name="prefix" />
      </div>

      <input
        class="w-full h-full px-3 rounded-inherit outline-none bg-transparent placeholder:select-none file:border-0 file:bg-transparent file:font-medium"
        :readonly="readonly"
        :disabled="disabled"
        :placeholder="placeholder"
        v-bind="$attrs"
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

    <PError v-if="error" class="mt-1.5">
      {{ error }}
    </PError>
  </div>
</template>

<style lang="postcss">
.pxd-input {
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
