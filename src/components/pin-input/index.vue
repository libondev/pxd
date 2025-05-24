<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
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
  inputMode?: HTMLAttributes['inputmode']
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

const computedInputMode = computed(() => {
  return props.type.includes('numeric') ? 'numeric' : 'text'
})

const computedClasses = computed(() => {
  const basic = ['pxd-input--border rounded-md motion-safe:transition-all']

  if (props.error) {
    basic.push('is-error')
  }

  if (props.disabled) {
    basic.push('is-disabled')
  }

  basic.push(computedSize.value)

  return basic
})

function toggleFocusInput(index: number) {
  if (index < 0 || index > props.length) {
    return
  }

  const input = containerRef.value!.querySelector(`div:nth-child(${index + 1}) > input`) as HTMLInputElement

  if (!input) {
    return
  }

  input.select()
}

// 点击空白的地方时聚焦输入框并选中方便下一次输入
function onContainerClick(ev: Event) {
  const el = ev.target as HTMLInputElement

  if (el.tagName !== 'INPUT') {
    return
  }

  el.select()
}

// 有些语言可以通过输入法来组合输入内容，但是不会触发 keydown, 在输入后清空输入框
function onCompositionEnd(ev: CompositionEvent) {
  const targetInput = ev.target as HTMLInputElement

  ev.preventDefault()
  targetInput.value = ''
}

const NUMERIC_REGEX = /^\d$/
const ALPHABETIC_REGEX = /^[a-z]$/i
const ALPHANUMERIC_REGEX = /^[0-9a-z]$/i

function shouldToggleNextInput(value: string) {
  if (!value) {
    return false
  }

  const { type } = props

  if (type.startsWith('numeric')) {
    return NUMERIC_REGEX.test(value)
  } else if (type.startsWith('alphabetic')) {
    return ALPHABETIC_REGEX.test(value)
  } else if (type.startsWith('alphanumeric')) {
    return ALPHANUMERIC_REGEX.test(value)
  }

  return false
}

function clearCurrentInputAndToggleInput(input: HTMLInputElement, index: number) {
  input.value = ''
  modelValueLocal.value[index] = ''
  modelValue.value = modelValueLocal.value.join('')

  const firstEmptyIndex = modelValueLocal.value.indexOf('')

  if (firstEmptyIndex === index || firstEmptyIndex === -1) {
    toggleFocusInput(index - 1)
  } else {
    toggleFocusInput(firstEmptyIndex)
  }
}

const ARROW_KEYS = ['ArrowLeft', 'ArrowRight']
const DELETE_KEYS = ['Backspace', 'Delete']

function onContainerKeydown(ev: KeyboardEvent) {
  const input = ev.target as HTMLInputElement
  const index = Number(input.dataset.index)
  const keyCode = ev.key

  if (ARROW_KEYS.includes(keyCode)) {
    ev.preventDefault()

    if (keyCode === 'ArrowLeft') {
      toggleFocusInput(index - 1)
    } else {
      toggleFocusInput(index + 1)
    }
  } else if (DELETE_KEYS.includes(keyCode)) {
    // 按下退格或删除键时也会触发 beforeinput
    // 而在移动端如果在这里不处理则需要删除两次才能清空并切换焦点
    ev.preventDefault()

    clearCurrentInputAndToggleInput(input, index)
  } else if (keyCode === 'Enter') {
    ev.preventDefault()
  }
}

function onBeforeInputValue(ev: Event) {
  const input = ev.target as HTMLInputElement
  const index = Number(input.dataset.index)
  const value = (ev as InputEvent).data || ''

  ev.preventDefault()

  if (!value) {
    clearCurrentInputAndToggleInput(input, index)

    return
  }

  // 判断输入的内容是否符合类型定义
  if (shouldToggleNextInput(value)) {
    input.value = value
    toggleFocusInput(index + 1)
    modelValueLocal.value[index] = value
    modelValue.value = modelValueLocal.value.join('')
  }
}

function onInputPasteValue(ev: ClipboardEvent) {
  ev.preventDefault()
  const text = ev.clipboardData?.getData('text')

  if (!text) {
    return
  }

  const slicedText = text.slice(0, props.length)

  modelValue.value = slicedText
  modelValueLocal.value = slicedText.split('')
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
      @click="onContainerClick"
      @keydown="onContainerKeydown"
      @compositionend="onCompositionEnd"
    >
      <div v-for="(n, i) of length" :key="n" :class="computedClasses">
        <input
          :value="modelValueLocal[i]"
          :aria-label="`pin code ${n} of ${length}`"
          :type="computedInputType"
          :data-index="i"
          class="aspect-square outline-none bg-transparent w-full h-full text-center rounded-inherit disabled:bg-gray-100 disabled:text-gray-700 disabled:cursor-not-allowed disabled:placeholder:text-gray-400 placeholder:select-none placeholder:text-gray-600 focus:placeholder:opacity-0 motion-safe:transition-all"
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
          @paste="onInputPasteValue"
          @beforeinput="onBeforeInputValue"
        >
      </div>
    </div>

    <PError v-if="error" class="mt-2" :size="size">
      {{ error }}
    </PError>
  </label>
</template>
