<script lang="ts" setup>
import type { ComponentLabel, ComponentSizeWithXs } from '../../types/components'
import { computed, ref, shallowRef } from 'vue'
import { useComputedSize } from '../../composables/useFallbackProps'
import { useModelValue } from '../../composables/useModelValue'
import PError from '../error/index.vue'

interface Props {
  size?: ComponentSizeWithXs
  error?: string
  length?: number
  label?: ComponentLabel
  readonly?: boolean
  disabled?: boolean
  required?: boolean
  modelValue?: string
  placeholder?: string
  type?: 'numeric' | 'alphabetic' | 'alphanumeric' | 'numeric-password' | 'alphabetic-password' | 'alphanumeric-password'
}

defineOptions({
  name: 'PPinInput',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    length: 4,
    modelValue: '',
    type: 'numeric',
    placeholder: '○',
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const SIZES = {
  xs: 'w-6 text-xs',
  sm: 'w-7.5 text-sm',
  md: 'w-9 text-sm',
  lg: 'w-10 text-base',
}

const containerRef = shallowRef<HTMLLabelElement>()

const modelValueLocal = ref<string[]>(
  (() => {
    if (typeof props.modelValue === 'string') {
      return (props.modelValue).split('')
    } else if (Array.isArray(props.modelValue)) {
      return props.modelValue
    }

    return Array.from({ length: props.length }, String)
  })(),
)

const modelValue = useModelValue(props, emits)
const computedSize = useComputedSize(props.size, SIZES)

const computedInputType = computed(() => {
  const { type } = props

  if (type.includes('password')) {
    return 'password'
  } else if (type === 'numeric') {
    return 'tel'
  }

  return 'text'
})

const computedInputMode = computed(() => props.type.includes('numeric') ? 'numeric' : 'text')

const computedClasses = computed(() => {
  const basic = [
    'pxd-input--border aspect-square text-center rounded-md outline-none bg-transparent',
    'disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:placeholder:text-gray-400',
    'placeholder:select-none placeholder:text-gray-600 focus:placeholder:opacity-0 motion-safe:transition-all',
  ]

  if (props.error) {
    basic.push('is-error')
  }

  if (props.disabled) {
    basic.push('is-disabled')
  }

  basic.push(computedSize.value)

  return basic
})

function onInputFocus(ev: FocusEvent) {
  const el = ev.target as HTMLInputElement

  if (el.tagName !== 'INPUT') {
    return
  }

  el.select()
}

function toggleFocusInput(index: number) {
  if (index < 0 || index >= props.length) {
    return
  }

  const input = containerRef.value!.children[index] as HTMLInputElement

  if (!input) {
    return
  }

  input.select()
}

// 有些语言可以通过输入法来组合输入内容，但是不会触发 keydown, 在输入后清空输入框
function onCompositionEnd(ev: CompositionEvent) {
  const targetInput = ev.target as HTMLInputElement

  ev.preventDefault()
  targetInput.value = ''
}

const DELETE_KEYS = ['Backspace', 'Delete']
const TOGGLE_KEYS = ['ArrowLeft', 'ArrowRight', 'Tab']
const ALLOWED_KEYS = [...DELETE_KEYS, ...TOGGLE_KEYS]

const NUMERIC_REGEX = /^\d$/
const ALPHABETIC_REGEX = /^[a-z]$/i
const ALPHANUMERIC_REGEX = /^[0-9a-z]$/i

async function onInputValue(ev: KeyboardEvent) {
  const targetInput = ev.target as HTMLInputElement
  const index = Number(targetInput.dataset.index)
  const value = ev.key

  const type = props.type

  if (type.startsWith('numeric') && !ALLOWED_KEYS.includes(value)) {
    if (!NUMERIC_REGEX.test(value)) {
      return
    }
  } else if (type.startsWith('alphabetic') && !ALLOWED_KEYS.includes(value)) {
    if (!ALPHABETIC_REGEX.test(value)) {
      return
    }
  } else if (type.startsWith('alphanumeric') && !ALLOWED_KEYS.includes(value)) {
    if (!ALPHANUMERIC_REGEX.test(value)) {
      return
    }
  }

  if (DELETE_KEYS.includes(value)) {
    modelValueLocal.value[index] = ''
    modelValue.value = modelValueLocal.value.join('')

    // 可能会有多个连续空格，需要找到第一个空格的索引
    const firstEmptyIndex = modelValueLocal.value.indexOf('')
    if (firstEmptyIndex === index) {
      toggleFocusInput(index - 1)
    } else {
      toggleFocusInput(firstEmptyIndex)
    }

    return
  }

  if (TOGGLE_KEYS.includes(value)) {
    if (value === 'ArrowLeft' || (value === 'Tab' && ev.shiftKey)) {
      toggleFocusInput(index - 1)
    } else if (value === 'ArrowRight' || (value === 'Tab' && !ev.shiftKey)) {
      toggleFocusInput(index + 1)
    }

    return
  }

  modelValueLocal.value[index] = value
  modelValue.value = modelValueLocal.value.join('')

  toggleFocusInput(index + 1)
}
</script>

<template>
  <label class="pxd-pin-input">
    <div v-if="label || $slots.label" class="pxd-input--label">
      <slot name="label">{{ label }}</slot>
    </div>

    <div
      ref="containerRef"
      class="flex items-center gap-2"
      @focusin="onInputFocus"
      @keydown.prevent="onInputValue"
      @compositionend="onCompositionEnd"
    >
      <input
        v-for="(n, i) of length"
        :key="n"
        :value="modelValueLocal[i]"
        :class="computedClasses"
        :aria-label="`pin code ${n} of ${length}`"
        :type="computedInputType"
        :data-index="i"
        minlength="1"
        maxlength="1"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
        :readonly="readonly"
        :disabled="disabled"
        :required="required"
        :placeholder="placeholder"
        :inputmode="computedInputMode"
      >
    </div>

    <PError v-if="error" class="mt-2" :size="size">
      {{ error }}
    </PError>
  </label>
</template>
