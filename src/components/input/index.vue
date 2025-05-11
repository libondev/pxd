<script lang="ts" setup>
import type { ComponentSizeWithXs } from '../../types/components'
import { EyeIcon, EyeOffIcon } from 'gdsi/vue'
import { twMerge } from 'tailwind-merge'
import { computed, shallowRef } from 'vue'
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
  password?: boolean
  minlength?: number | string
  maxlength?: number | string
  modelValue?: string | number | readonly string[] | null
  placeholder?: string
  prefixStyle?: boolean
  suffixStyle?: boolean
}

defineOptions({
  name: 'PInput',
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
  'update:modelValue': [NonNullable<Props['modelValue']>]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'change': [Event]
}>()

const randomId = getRandomId()

const SIZES = {
  xs: 'h-6 text-xs',
  sm: 'h-7.5 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10 text-base',
}

const modelValue = useModelValue(props, emits)
const internalInputType = shallowRef(props.password ? 'password' : 'text')
const computedSize = useComputedSize(props.size, SIZES)

const computedClasses = computed(() => {
  const basic = ['pxd-input--container flex items-center relative rounded-inherit h-full motion-safe:transition-all overflow-hidden rounded-md bg-background']

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

function togglePasswordType() {
  internalInputType.value = internalInputType.value === 'password' ? 'text' : 'password'
}
</script>

<template>
  <label class="pxd-input max-w-full" :for="randomId">
    <div v-if="label || $slots.label" class="pxd-input--label text-sm text-gray-900 mb-2 max-w-full">
      <slot name="label">{{ label }}</slot>
    </div>

    <div :class="computedClasses">
      <div
        v-if="$slots.prefix"
        aria-hidden="true"
        class="pxd-input--prefix pl-3 h-full flex items-center text-sm text-gray-700 "
        :class="{ 'bg-background-secondary rounded-tl-inherit rounded-bl-inherit border-r pr-3': prefixStyle }"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="randomId"
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
        class="pxd-input--suffix pr-3 h-full flex items-center text-sm text-gray-700"
        :class="{ 'bg-background-secondary rounded-tr-inherit rounded-br-inherit border-l pl-3': suffixStyle }"
      >
        <slot name="suffix" />
      </div>
    </div>

    <PError v-if="error" class="mt-2" :size="size">
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
