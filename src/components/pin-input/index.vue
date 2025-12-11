<script lang="ts" setup>
import type { HTMLAttributes } from 'vue'
import type { ComponentLabel, ComponentSizeWithXs } from '../../types/shared'
import { computed, ref, shallowRef } from 'vue'
import { useConfigProvider } from '../../composables/use-config-provider-context'
import { useModelValue } from '../../composables/use-model-value'
import { getFallbackValue } from '../../utils/get'
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

const config = useConfigProvider()

const inputsRef = shallowRef<HTMLInputElement[]>([])

const modelValue = useModelValue(props, emits)

const modelValueLocal = ref<string[]>(
  (() => {
    if (typeof props.modelValue === 'string') {
      return (props.modelValue).split('')
    } else if (Array.isArray(props.modelValue)) {
      return props.modelValue
    }

    return Array.from({ length: props.length }, () => '')
  })(),
)

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

const computedClass = computed(() => {
  const classes = ['pxd-input--border rounded-md motion-safe:transition-all']

  if (props.error) {
    classes.push('is-error')
  }

  if (props.disabled) {
    classes.push('is-disabled')
  }

  classes.push(getFallbackValue(props.size, SIZES, config.size))

  return classes.join(' ')
})

function setInputValue(value: string, index?: number) {
  if (index !== undefined) {
    inputsRef.value[index]!.value = value
    modelValueLocal.value[index] = value
  } else {
    modelValueLocal.value = value.split('')
  }

  modelValue.value = value
}

function focusInputField(dir: 'next' | 'prev', index: number): void
function focusInputField(dir: 'first' | 'last', index?: number): void
function focusInputField(dir: 'next' | 'prev' | 'first' | 'last', index?: number): void {
  let correctIndex = -1

  if (dir === 'next') {
    correctIndex = index! + 1
  } else if (dir === 'prev') {
    correctIndex = index! - 1
  } else if (dir === 'first') {
    correctIndex = 0
  } else if (dir === 'last') {
    correctIndex = props.length - 1
  }

  if (correctIndex < 0 || correctIndex >= props.length) {
    return
  }

  inputsRef.value[correctIndex]!.select()
}

function getFirstEmptyIndex() {
  const length = modelValueLocal.value.length

  if (length === props.length) {
    return modelValueLocal.value.findIndex(value => !value)
  }

  return length
}

function onContainerClick(ev: MouseEvent) {
  const input = ev.target as HTMLInputElement

  if (input.tagName !== 'INPUT') {
    return
  }

  const index = Number(input.dataset.index)
  const firstEmptyIndex = getFirstEmptyIndex()

  if (index === firstEmptyIndex || firstEmptyIndex >= props.length) {
    return
  }

  inputsRef.value[firstEmptyIndex]?.select()
}

// 使用输入法输入完成后触发 compositionend
function onCompositionEnd(ev: CompositionEvent) {
  const input = ev.target as HTMLInputElement
  const index = Number(input.dataset.index)
  const value = ev.data

  if (validateInputValue(value)) {
    setInputValue(value)

    return
  }

  setInputValue('', index)
}

const NUMERIC_REGEX = /^\d+$/
const ALPHABETIC_REGEX = /^[a-z]+$/i
const ALPHANUMERIC_REGEX = /^[0-9a-z]+$/i

function validateInputValue(value: string) {
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

// 按下方向键的时候切换输入框的焦点
function onContainerKeydown(ev: KeyboardEvent) {
  const index = Number((ev.target as HTMLInputElement).dataset.index)
  const key = ev.key

  if (key === 'ArrowLeft') {
    ev.preventDefault()
    focusInputField('prev', index)
  } else if (key === 'ArrowRight') {
    ev.preventDefault()
    focusInputField('next', index)
  }
}

function onBeforeInputValue(ev: Event) {
  const event = ev as InputEvent

  if (event.isComposing) {
    ev.preventDefault()
    return
  }

  const input = event.target as HTMLInputElement
  const index = Number(input.dataset.index)
  const value = event.data || ''

  if (event.inputType === 'deleteContentBackward') {
    ev.preventDefault()
    setInputValue('', index)
    focusInputField('prev', index)
  } else if (event.inputType === 'deleteContentForward') {
    ev.preventDefault()
    setInputValue('', index)
  } else if (event.inputType === 'insertCompositionText') {
    ev.preventDefault()
  } else if (event.inputType === 'insertText') {
    ev.preventDefault()

    if (validateInputValue(value)) {
      setInputValue(value, index)
      focusInputField('next', index)
    }
  }
}

function onInputPastedValue(ev: ClipboardEvent) {
  ev.preventDefault()
  const text = ev.clipboardData?.getData('text')

  if (!text) {
    return
  }

  const slicedText = text.slice(0, props.length)

  if (validateInputValue(slicedText)) {
    setInputValue(slicedText)
  }
}
</script>

<template>
  <label class="pxd-pin-input flex w-max flex-col">
    <div v-if="label || $slots.label" class="pxd-form--label">
      <slot name="label">{{ label }}</slot>
    </div>

    <div
      class="gap-1.5 flex w-max items-center"
      @keydown="onContainerKeydown"
      @compositionend="onCompositionEnd"
      @click="onContainerClick"
    >
      <div v-for="(n, i) of length" :key="n" :class="computedClass">
        <input
          ref="inputsRef"
          :value="modelValueLocal[i]"
          :aria-label="`pin code ${n} of ${length}`"
          :type="computedInputType"
          :data-index="i"
          class="aspect-square size-full appearance-none rounded-inherit border-none bg-transparent text-center font-inherit outline-none placeholder:text-gray-600 placeholder:select-none focus:placeholder:opacity-0 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:placeholder:text-gray-400 motion-safe:transition-all"
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
          @paste="onInputPastedValue"
          @beforeinput="onBeforeInputValue"
        >
      </div>
    </div>

    <PError v-if="error" class="mt-2" :size="size">
      {{ error }}
    </PError>
  </label>
</template>
