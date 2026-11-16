<script lang="ts" setup>
import type { NumberInputData, NumberInputEmits, NumberInputProps } from './types'
import MinusIcon from '@gdsicon/vue/minus'
import PlusIcon from '@gdsicon/vue/plus'
import { computed, reactive, shallowRef, watch } from 'vue'
import { useModelCommit } from '../../composables/_internal/use-model-commit.js'
import { useRepeatAction } from '../../composables/use-repeat-action.js'
import { NOOP, isCompositionKeydown } from '../../utils/event.js'
import { toNumber } from '../../utils/format.js'
import { isNil, isNumber, isUndefined } from '../../utils/is.js'
import PInput from '../input/index.vue'

defineOptions({
  name: 'PNumberInput',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NumberInputProps>(), {
  step: 1,
  controls: true,
  clearValue: null,
  scientific: true,
  controlsPosition: 'sides',
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  thousandsSeparator: ',',
})

const emits = defineEmits<NumberInputEmits>()

const REGEXPS = {
  'remove-leading-zeros': /^(-?)0+(?=\d)/,
  'thousands-separator': /\B(?=(\d{3})+(?!\d))/g,
  'invalid-char': /[^\d.eE+-]/g,
  'invalid-char-plain': /[^\d.+-]/g,
  'number-prefix': /^[-+]?\d*\.?\d*(?:[eE][-+]?\d*)?/,
}

const isFocused = shallowRef(false)

const inputData = reactive<NumberInputData>({
  currentValue: props.modelValue ?? null,
  userInput: null,
})
const inputValue = computed(() => {
  if (inputData.userInput !== null) {
    return inputData.userInput
  }

  let currentValue: number | string | undefined | null = inputData.currentValue

  if (isNil(currentValue)) {
    return ''
  }

  if (isNumber(currentValue)) {
    if (Number.isNaN(currentValue)) {
      return ''
    }

    if (!isUndefined(props.precision)) {
      currentValue = currentValue.toFixed(props.precision)
    }
  }

  if (props.thousands && !isFocused.value) {
    return formatWithThousands(currentValue)
  }

  return currentValue
})

const decreaseDisabled = computed(
  () => props.disabled || (isNumber(props.modelValue) && props.modelValue <= props.min),
)
const increaseDisabled = computed(
  () => props.disabled || (isNumber(props.modelValue) && props.modelValue >= props.max),
)
const valuePrecision = computed(() => {
  if (!isUndefined(props.precision)) {
    return props.precision
  }

  const stringValue = String(props.step)

  const decimalIndex = stringValue.indexOf('.')

  if (decimalIndex === -1) {
    return 0
  }

  return stringValue.length - decimalIndex - 1
})
const inputAttrs = computed(() => ({
  role: 'spinbutton',
  'aria-valuenow': isNil(inputData.currentValue) ? undefined : inputData.currentValue,
  'aria-valuemin': props.min,
  'aria-valuemax': props.max,
}))

const { modelValue, commit } = useModelCommit(props, emits)
const { start: startDecrease, stop: stopDecrease } = useRepeatAction({
  enabled: () => !decreaseDisabled.value,
  action: decreaseValue,
})
const { start: startIncrease, stop: stopIncrease } = useRepeatAction({
  enabled: () => !increaseDisabled.value,
  action: increaseValue,
})

function formatWithThousands(value: string | number): string {
  const str = String(value)
  const dotIndex = str.indexOf('.')
  const intPart = dotIndex === -1 ? str : str.slice(0, dotIndex)
  const decPart = dotIndex === -1 ? '' : str.slice(dotIndex)
  return intPart.replace(REGEXPS['thousands-separator'], props.thousandsSeparator) + decPart
}
function parseInputValue(value: string) {
  const plain = props.thousands ? value.split(props.thousandsSeparator).join('') : value

  return Number.parseFloat(plain)
}
function normalizeInputValue(value: string) {
  const str = String(value)
  const plain = props.thousands ? str.split(props.thousandsSeparator).join('') : str
  const chars = plain.replace(REGEXPS[props.scientific ? 'invalid-char' : 'invalid-char-plain'], '')
  const prefix = chars.match(REGEXPS['number-prefix'])?.[0] ?? ''

  return prefix.replace(REGEXPS['remove-leading-zeros'], '$1')
}
function toPrecision(value: number) {
  if (!Number.isFinite(value)) {
    return value
  }

  const p = Math.max(0, valuePrecision.value)
  const factor = 10 ** p

  return Math.round(value * factor) / factor
}

function clampToRange(value: number) {
  if (value > props.max) {
    return props.max
  }

  if (value < props.min) {
    return props.min
  }

  return value
}
function normalize(value: number | null) {
  if (!isNumber(value)) {
    return value
  }

  return clampToRange(toPrecision(value))
}

function increaseValue() {
  if (props.readonly || props.disabled || increaseDisabled.value) {
    return
  }

  const value = normalize(toNumber(inputData.currentValue) + props.step)

  inputData.currentValue = value
  modelValue.value = value
}

function decreaseValue() {
  if (props.readonly || props.disabled || decreaseDisabled.value) {
    return
  }

  const value = normalize(toNumber(inputData.currentValue) - props.step)

  inputData.currentValue = value
  modelValue.value = value
}

function onInputKeydown(ev: KeyboardEvent) {
  if (isCompositionKeydown(ev)) {
    return
  }

  const key = ev.key

  if (!props.scientific && ['e', 'E'].includes(key)) {
    ev.preventDefault()
    return
  }

  if (ev.key === 'ArrowUp') {
    ev.preventDefault()
    increaseValue()
  } else if (ev.key === 'ArrowDown') {
    ev.preventDefault()
    decreaseValue()
  } else if (ev.key === 'Escape') {
    clearInput(ev)
  }
}

function clearInput(ev: KeyboardEvent) {
  const hadValue = !isNil(inputData.currentValue)

  inputData.userInput = null

  if (props.clearValue !== inputData.currentValue) {
    inputData.currentValue = props.clearValue
    modelValue.value = props.clearValue
  }

  commit(props.clearValue, ev)

  if (hadValue) {
    ev.preventDefault()
  }
}

function onInputFocus(event: FocusEvent) {
  isFocused.value = true
  emits('focus', event)
}

function onInputBlur(event: FocusEvent) {
  isFocused.value = false
  inputData.userInput = null

  const value = normalize(inputData.currentValue)

  if (value !== inputData.currentValue) {
    inputData.currentValue = value
    modelValue.value = value
  }

  if (inputData.currentValue === null) {
    ;(event.target as HTMLInputElement).value = ''
  }

  emits('blur', event)
}

function onInputInput(text: string) {
  const normalized = normalizeInputValue(text)
  const value = normalized === '' ? null : parseInputValue(normalized)

  inputData.userInput = normalized

  if (value !== null && Number.isNaN(value)) {
    return
  }

  inputData.currentValue = value
  modelValue.value = value
}

function onInputChange(text: string, event: Event) {
  const normalized = normalizeInputValue(text)
  const parsed = normalized === '' ? null : parseInputValue(normalized)

  if (parsed !== null && Number.isNaN(parsed)) {
    return
  }

  const value = normalize(parsed)

  if (value !== inputData.currentValue) {
    inputData.currentValue = value
    modelValue.value = value
  }

  commit(value, event)
}

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (inputData.userInput === null && newVal !== oldVal) {
      inputData.currentValue = isNil(newVal) ? null : newVal
    }
  },
  { immediate: true },
)
</script>

<template>
  <PInput
    data-number-input
    :min="min"
    :max="max"
    align="center"
    inputmode="decimal"
    input-type="text"
    :input-attrs="inputAttrs"
    :disabled="disabled"
    :readonly="readonly"
    :clear-on-press-escape="false"
    :model-value="inputValue"
    :default-prefix-style="false"
    :default-suffix-style="false"
    v-bind="$attrs"
    @blur="onInputBlur"
    @focus="onInputFocus"
    @change="onInputChange"
    @keydown="onInputKeydown"
    @update:model-value="onInputInput"
  >
    <template #prefix>
      <button
        v-if="controls && controlsPosition !== 'right'"
        tabindex="-1"
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center rounded-l-inherit border-r font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="decreaseDisabled"
        @pointerdown="startDecrease"
        @pointercancel="stopDecrease"
        @pointerup="stopDecrease"
        @contextmenu.prevent="NOOP"
      >
        <slot name="minusIcon">
          <MinusIcon />
        </slot>
      </button>

      <slot name="prefix" />
    </template>

    <template #suffix>
      <slot name="suffix" />

      <div
        v-if="controls && controlsPosition === 'right'"
        class="flex aspect-square h-full flex-col rounded-r-inherit border-l"
      >
        <button
          tabindex="-1"
          class="flex h-1/2 w-full cursor-pointer touch-manipulation appearance-none items-center justify-center rounded-tr-inherit border-b font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
          :disabled="increaseDisabled"
          @pointerdown="startIncrease"
          @pointercancel="stopIncrease"
          @pointerup="stopIncrease"
          @contextmenu.prevent="NOOP"
        >
          <slot name="plusIcon">
            <PlusIcon class="size-2" />
          </slot>
        </button>

        <button
          tabindex="-1"
          class="flex h-1/2 w-full cursor-pointer touch-manipulation appearance-none items-center justify-center rounded-br-inherit font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
          :disabled="decreaseDisabled"
          @pointerdown="startDecrease"
          @pointercancel="stopDecrease"
          @pointerup="stopDecrease"
          @contextmenu.prevent="NOOP"
        >
          <slot name="minusIcon">
            <MinusIcon class="size-2" />
          </slot>
        </button>
      </div>

      <button
        v-else-if="controls"
        tabindex="-1"
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center rounded-r-inherit border-l font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="increaseDisabled"
        @pointerdown="startIncrease"
        @pointercancel="stopIncrease"
        @pointerup="stopIncrease"
        @contextmenu.prevent="NOOP"
      >
        <slot name="plusIcon">
          <PlusIcon />
        </slot>
      </button>
    </template>
  </PInput>
</template>
