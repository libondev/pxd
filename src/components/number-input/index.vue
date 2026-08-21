<script lang="ts" setup>
import type { NumberInputData, NumberInputEmits, NumberInputProps } from './types'
import MinusIcon from '@gdsicon/vue/minus'
import PlusIcon from '@gdsicon/vue/plus'
import { computed, reactive, shallowRef, watch } from 'vue'
import { useModelValue } from '../../composables/use-model-value.js'
import { useRepeatAction } from '../../composables/use-repeat-action.js'
import { NOOP } from '../../utils/event.js'
import { isNil, isNumber, isUndefined } from '../../utils/is.js'
import PInput from '../input/index.vue'

defineOptions({
  name: 'PNumberInput',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<NumberInputProps>(), {
  step: 1,
  controls: true,
  clearValue: null,
  scientific: true,
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  thousandsSeparator: ',',
})

const emits = defineEmits<NumberInputEmits>()

const modelValue = useModelValue(props, emits, { withChange: false })

const REGEXPS = {
  'remove-leading-zeros': /^(-?)0+(?=\d)/,
  'thousands-separator': /\B(?=(\d{3})+(?!\d))/g,
}

const isFocused = shallowRef(false)

const inputData = reactive<NumberInputData>({
  currentValue: props.modelValue,
  userInput: null,
})

function formatWithThousands(value: string | number): string {
  const str = String(value)
  const dotIndex = str.indexOf('.')
  const intPart = dotIndex === -1 ? str : str.slice(0, dotIndex)
  const decPart = dotIndex === -1 ? '' : str.slice(dotIndex)
  return intPart.replace(REGEXPS['thousands-separator'], props.thousandsSeparator) + decPart
}

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
  if (props.precision) {
    return props.precision
  }

  const stringValue = String(props.step)

  const decimalIndex = stringValue.indexOf('.')

  if (decimalIndex === -1) {
    return 0
  }

  return stringValue.length - decimalIndex - 1
})

const { start: startDecrease, stop: stopDecrease } = useRepeatAction({
  disabled: decreaseDisabled,
  action: decreaseValue,
})

const { start: startIncrease, stop: stopIncrease } = useRepeatAction({
  disabled: increaseDisabled,
  action: increaseValue,
})

function toPrecision(value: number | null) {
  if (!value) {
    return value
  }

  if (Number.isNaN(value)) {
    return 0
  }

  if (!Number.isFinite(value)) {
    return value
  }

  const p = Math.max(0, valuePrecision.value ?? 0)
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

function increaseValue() {
  if (props.readonly || props.disabled || increaseDisabled.value) {
    return
  }

  const numeric = Number(inputValue.value) || 0
  const value = toPrecision(numeric + props.step)

  inputData.currentValue = value
  modelValue.value = clampToRange(value ?? 0)
}

function decreaseValue() {
  if (props.readonly || props.disabled || decreaseDisabled.value) {
    return
  }

  const numeric = Number(inputValue.value) || 0
  const value = toPrecision(numeric - props.step)

  inputData.currentValue = value
  modelValue.value = clampToRange(value ?? 0)
}

function onInputKeydown(ev: KeyboardEvent) {
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
  }
}

function onInputFocus(event: FocusEvent) {
  isFocused.value = true
  emits('focus', event)
}

function onInputBlur(event: FocusEvent) {
  isFocused.value = false
  inputData.userInput = null

  if (isNumber(inputData.currentValue)) {
    const clamped = clampToRange(inputData.currentValue)
    if (clamped !== inputData.currentValue) {
      inputData.currentValue = clamped
      modelValue.value = clamped
    }
  }

  if (inputData.currentValue === null) {
    ;(event.target as HTMLInputElement).value = ''
  }

  emits('blur', event)
}

function onInputInput(value: string) {
  const normalized = value.replace(REGEXPS['remove-leading-zeros'], '$1')
  inputData.userInput = normalized

  const newValue = normalized === '' ? null : Number.parseFloat(normalized)

  inputData.currentValue = toPrecision(newValue ?? 0)
  modelValue.value = inputData.currentValue
}

function onInputChange(value: string, event: Event) {
  let newValue = toPrecision(value === '' ? null : Number.parseFloat(value))

  if (isNumber(newValue)) {
    newValue = clampToRange(newValue)
  }

  emits('change', newValue, event)
}

watch(
  () => props.modelValue,
  (newVal, oldVal) => {
    if (inputData.userInput === null && newVal !== oldVal) {
      inputData.currentValue = toPrecision(props.modelValue ?? 0)
    }
  },
  { immediate: true },
)
</script>

<template>
  <PInput
    v-bind="$attrs"
    :min="min"
    :max="max"
    align="center"
    inputmode="decimal"
    input-type="number"
    :disabled="disabled"
    :readonly="readonly"
    :clear-value="clearValue"
    :model-value="inputValue"
    :default-prefix-style="false"
    :default-suffix-style="false"
    @blur="onInputBlur"
    @focus="onInputFocus"
    @change="onInputChange"
    @keydown="onInputKeydown"
    @update:model-value="onInputInput"
  >
    <template #prefix>
      <button
        v-if="controls"
        tabindex="-1"
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center border-r font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="decreaseDisabled"
        @pointerdown="startDecrease"
        @pointercancel="stopDecrease"
        @pointerup="stopDecrease"
        @contextmenu.prevent="NOOP"
      >
        <slot name="minusIcon">
          <MinusIcon class="pointer-events-none" />
        </slot>
      </button>

      <slot name="prefix" />
    </template>

    <template #suffix>
      <slot name="suffix" />

      <button
        v-if="controls"
        tabindex="-1"
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center border-l font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="increaseDisabled"
        @pointerdown="startIncrease"
        @pointercancel="stopIncrease"
        @pointerup="stopIncrease"
        @contextmenu.prevent="NOOP"
      >
        <slot name="plusIcon">
          <PlusIcon class="pointer-events-none" />
        </slot>
      </button>
    </template>
  </PInput>
</template>
