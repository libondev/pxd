<script lang="ts" setup>
import type { PinInputEmits, PinInputProps } from './types'
import { computed, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/_internal/use-model-value.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { BASIC_HEIGHTS } from '../../constants/size.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isTruthyProp } from '../../utils/format.js'
import { isUndefined } from '../../utils/is.js'

defineOptions({
  name: 'PPinInput',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<PinInputProps>(), {
  length: 4,
  modelValue: '',
  type: 'numeric',
  placeholder: '○',
})

const emits = defineEmits<PinInputEmits>()

const configProvider = useConfigProvider()

const inputsRef = shallowRef<HTMLInputElement[]>([])

const modelValue = useModelValue(props, emits)

let localValue: string = modelValue.value

const computedInputType = computed(() => {
  const { type } = props

  if (type.includes('password')) {
    return 'password'
  } else if (type === 'numeric') {
    return 'numeric'
  }

  return 'text'
})

const computedInputMode = computed(() => {
  return props.type.includes('numeric') ? 'numeric' : 'text'
})

const { classes } = useTailwindVariant(
  {
    base: 'pxd-input--border rounded-md motion-safe:transition-appearance',
    variants: {
      size: {
        xs: `${BASIC_HEIGHTS.xs} text-xs`,
        sm: `${BASIC_HEIGHTS.sm} text-sm`,
        md: `${BASIC_HEIGHTS.md} text-sm`,
        lg: `${BASIC_HEIGHTS.lg} text-base`,
      },
      error: {
        true: 'is-error',
      },
      disabled: {
        true: 'is-disabled',
      },
    },
  },
  {
    mergeAttrsClass: false,
    selection: () => ({
      size: props.size || configProvider.size,
      error: isTruthyProp(props.error),
      disabled: isTruthyProp(props.disabled),
    }),
  },
)

function replaceCharAt(str: string, index: number, char: string) {
  return str.substring(0, index) + char + str.substring(index + 1)
}

function setInputValue(value: string, index?: number) {
  if (isUndefined(index)) {
    localValue = value
  } else {
    inputsRef.value[index]!.value = value
    localValue = replaceCharAt(localValue, index, value)
  }

  modelValue.value = localValue
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
  const length = localValue.length

  if (length === props.length) {
    return localValue.split('').findIndex((value) => !value)
  }

  return length
}

function onInputElFocus(ev: FocusEvent) {
  ev.preventDefault()

  const inputEl = ev.target as HTMLInputElement
  inputEl.select?.()
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

function focus() {
  focusInputField('first')
}

function blur() {
  inputsRef.value.forEach((input) => input.blur())
}

watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue === localValue) {
      return
    }

    localValue = newValue
  },
)

defineExpose({
  focus,
  blur,
})
</script>

<template>
  <label
    v-bind="$attrs"
    class="pxd-pin-input gap-1.5 flex size-max items-center"
    @keydown="onContainerKeydown"
    @compositionend="onCompositionEnd"
    @focusin="onInputElFocus"
    @click="onContainerClick"
  >
    <div v-for="(n, i) of length" :key="n" :class="classes">
      <input
        ref="inputsRef"
        :value="modelValue[i]"
        :aria-label="`pin code ${n} of ${length}`"
        :type="computedInputType"
        :data-index="i"
        class="aspect-square size-full appearance-none rounded-inherit border-none bg-transparent text-center font-inherit outline-none placeholder:text-gray-600 placeholder:select-none focus:placeholder:opacity-0 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 disabled:placeholder:text-gray-400 motion-safe:transition-appearance"
        name="pin-input"
        minlength="1"
        maxlength="1"
        autocorrect="off"
        autocomplete="off"
        autocapitalize="off"
        :readonly="readonly"
        :disabled="disabled"
        :placeholder="placeholder"
        :inputmode="computedInputMode"
        @paste="onInputPastedValue"
        @beforeinput="onBeforeInputValue"
      />
    </div>
  </label>
</template>
