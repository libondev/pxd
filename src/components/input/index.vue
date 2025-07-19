<script lang="ts" setup>
import type { ComponentLabel, ComponentSizeWithXs } from '../../types/components'
import CrossIcon from '@gdsicon/vue/cross'
import EyeIcon from '@gdsicon/vue/eye'
import EyeOffIcon from '@gdsicon/vue/eye-off'
import { computed, shallowRef } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { useModelValue } from '../../composables/useModelValue'
import { getUniqueId } from '../../utils/uid'
import { getFallbackValue } from '../../utils/value'
import PError from '../error/index.vue'

interface Props {
  size?: ComponentSizeWithXs
  error?: string
  label?: ComponentLabel
  readonly?: boolean
  disabled?: boolean
  password?: boolean
  required?: boolean
  autofocus?: boolean
  minlength?: number | string
  maxlength?: number | string
  modelValue?: ComponentLabel
  allowClear?: boolean
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
  'update:modelValue': [string]
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'change': [Event]
}>()

const uniqueId = getUniqueId()

const SIZES = {
  xs: 'h-6 text-xs',
  sm: 'h-7.5 text-sm',
  md: 'h-9 text-sm',
  lg: 'h-10 text-base',
}

const config = useConfigProvider()
const modelValue = useModelValue(props, emits)
const internalInputType = shallowRef(props.password ? 'password' : 'text')

const computedClass = computed(() => {
  const classes = ['pxd-input--border flex items-center relative overflow-hidden rounded-md bg-background motion-safe:transition-all']

  classes.push(getFallbackValue(props.size, SIZES, config.size))

  if (props.disabled) {
    classes.push('is-disabled')
  }

  if (props.readonly) {
    classes.push('is-readonly')
  }

  if (props.error) {
    classes.push('is-error')
  }

  return classes.join(' ')
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

function clearInputValue() {
  modelValue.value = ''
}
</script>

<template>
  <label class="pxd-input block w-full max-w-full" :for="uniqueId">
    <div v-if="label || $slots.label" class="pxd-form--label">
      <slot name="label">{{ label }}</slot>
    </div>

    <div :class="computedClass">
      <div
        v-if="$slots.prefix"
        aria-hidden="true"
        class="pxd-input--prefix pl-3 h-full flex items-center text-sm text-gray-700 "
        :class="{ 'bg-background-secondary rounded-tl-inherit rounded-bl-inherit border-r pr-3': prefixStyle }"
      >
        <slot name="prefix" />
      </div>

      <input
        :id="uniqueId"
        v-model="modelValue"
        class="w-full h-full px-3 rounded-inherit outline-none bg-transparent disabled:text-gray-700 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:placeholder:text-gray-400 placeholder:select-none placeholder:text-gray-600 file:border-0 file:bg-transparent file:font-medium"
        :class="{ 'pr-9': password || allowClear }"
        :type="internalInputType"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :minlength="minlength"
        :maxlength="maxlength"
        :autofocus="autofocus"
        :placeholder="placeholder"
        @change="onInputChange"
        @focus="onInputFocus"
        @blur="onInputBlur"
      >

      <div
        v-if="password || allowClear"
        v-show="modelValue"
        class="pxd-input--icon absolute right-0 top-0 h-full text-foreground-secondary rounded-tr-inherit rounded-br-inherit cursor-pointer flex items-center hover:text-gray-1000 hover:bg-gray-alpha-100 active:bg-gray-alpha-300 motion-safe:transition-colors"
      >
        <div v-if="password" class="p-3" @click.prevent="togglePasswordType">
          <EyeIcon v-if="internalInputType === 'password'" class="size-3" />
          <EyeOffIcon v-else class="size-3" />
        </div>
        <div v-if="allowClear" class="p-3" @click.prevent="clearInputValue">
          <CrossIcon class="size-3" />
        </div>
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
