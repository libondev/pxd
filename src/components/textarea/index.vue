<script setup lang="ts">
import type { ComponentSizeWithXs } from '../../types/components'
import { twMerge } from 'tailwind-merge'
import { computed } from 'vue'
import { useComputedSize } from '../../composables/useComputedSize'
import { useModelValue } from '../../composables/useModelValue'
import { getRandomId } from '../../utils/random'
import PError from '../error/index.vue'

interface Props {
  size?: ComponentSizeWithXs
  error?: string
  label?: string
  readonly?: boolean
  disabled?: boolean
  modelValue?: string | number | readonly string[] | null
  placeholder?: string
  minlength?: number | string
  maxlength?: number | string
}

defineOptions({
  name: 'PTextarea',
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
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'change': [Event]
}>()

const randomId = getRandomId()

const SIZES = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
}

const modelValue = useModelValue(props, emits)

const computedSize = useComputedSize(props.size, SIZES)

const computedClasses = computed(() => {
  const basic = ['pxd-input--container flex items-center justify-center rounded-inherit h-full motion-safe:transition-all overflow-hidden rounded-md bg-background']

  basic.push(computedSize.value)

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
  <label class="pxd-textarea w-full max-w-full" :for="randomId">
    <div v-if="label || $slots.label" class="text-sm text-gray-900 mb-2 max-w-full">
      <slot name="label">{{ label }}</slot>
    </div>

    <div :class="computedClasses">
      <textarea
        :id="randomId"
        v-model="modelValue"
        class="w-full h-full py-2.5 px-3 rounded-inherit outline-none bg-transparent resize-none disabled:text-gray-700 disabled:cursor-not-allowed placeholder:select-none"
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
      />
    </div>

    <PError v-if="error" class="mt-1.5" :size="size">
      {{ error }}
    </PError>
  </label>
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
