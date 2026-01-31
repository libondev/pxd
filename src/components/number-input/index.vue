<script lang="ts" setup>
import MinusIcon from '@gdsicon/vue/minus'
import PlusIcon from '@gdsicon/vue/plus'
import { isNil, isNumber, isUndefined } from 'es-toolkit'
import { computed, reactive, watch } from 'vue'
import { useRepeatAction } from '../../composables/use-repeat-action'
import { NOOP } from '../../utils/event'
import PInput from '../input/index.vue'

interface Props {
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  disabled?: boolean
  precision?: number
  scientific?: boolean
  clearValue?: number | null
  modelValue?: number | null
}

defineOptions({
  name: 'PNumberInput',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    step: 1,
    clearValue: null,
    scientific: true,
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
  },
)

const emits = defineEmits<{
  'focus': [FocusEvent]
  'blur': [FocusEvent]
  'input': [Props['modelValue']]
  'change': [Props['modelValue'], Event]
  'update:modelValue': [Props['modelValue']]
}>()

const modelValue = computed({
  get() {
    return props.modelValue
  },
  set(value) {
    emits('input', value)
    emits('update:modelValue', value)
  },
})

interface InputData {
  currentValue: Props['modelValue']
  userInput: string | null
}

const inputData = reactive<InputData>({
  currentValue: props.modelValue,
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

  return currentValue
})

const decreaseDisabled = computed(() => props.disabled || (isNumber(props.modelValue) && props.modelValue <= props.min))
const increaseDisabled = computed(() => props.disabled || (isNumber(props.modelValue) && props.modelValue >= props.max))

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

const {
  start: startDecrease,
  stop: stopDecrease,
} = useRepeatAction({
  disabled: decreaseDisabled,
  action: decreaseValue,
})

const {
  start: startIncrease,
  stop: stopIncrease,
} = useRepeatAction({
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
  emits('focus', event)
}

function onInputBlur(event: FocusEvent) {
  inputData.userInput = null

  if (inputData.currentValue === null) {
    (event.target as HTMLInputElement).value = ''
  }

  emits('blur', event)
}

function onInputInput(value: string) {
  inputData.userInput = value

  const newValue = value === '' ? null : Number.parseFloat(value)

  inputData.currentValue = toPrecision(newValue ?? 0)
  modelValue.value = inputData.currentValue
}

function onInputChange(value: string, event: Event) {
  const newValue = toPrecision(value === '' ? null : Number.parseFloat(value))

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
    :prefix-style="false"
    :suffix-style="false"
    :clear-value="clearValue"
    :model-value="inputValue"
    @blur="onInputBlur"
    @focus="onInputFocus"
    @input="onInputInput"
    @change="onInputChange"
    @keydown="onInputKeydown"
  >
    <template #prefix>
      <button
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center border-r font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="decreaseDisabled"
        @pointerdown="startDecrease"
        @pointercancel="stopDecrease"
        @pointerup="stopDecrease"
        @contextmenu.prevent="NOOP"
      >
        <MinusIcon class="pointer-events-none" />
      </button>

      <slot name="prefix" />
    </template>

    <template #suffix>
      <slot name="suffix" />

      <button
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center border-l font-inherit text-foreground outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="increaseDisabled"
        @pointerdown="startIncrease"
        @pointercancel="stopIncrease"
        @pointerup="stopIncrease"
        @contextmenu.prevent="NOOP"
      >
        <PlusIcon class="pointer-events-none" />
      </button>
    </template>
  </PInput>
</template>
