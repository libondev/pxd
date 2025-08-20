<script lang="ts" setup>
import type { Nullable, Numeric } from '../../types/shared/utils'
import MinusIcon from '@gdsicon/vue/minus'
import PlusIcon from '@gdsicon/vue/plus'
import { computed } from 'vue'
import { useModelValue } from '../../composables/use-model-value'
import { useRepeatAction } from '../../composables/use-repeat-action'
import { FLOATING_REGEX, SCIENCE_NUMERIC_REGEX } from '../../utils/regexp'
import PInput from '../input/index.vue'

interface Props {
  min?: number
  max?: number
  step?: number
  readonly?: boolean
  disabled?: boolean
  precision?: number
  scientific?: boolean
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
    min: Number.MIN_SAFE_INTEGER,
    max: Number.MAX_SAFE_INTEGER,
    readonly: false,
    disabled: false,
    scientific: true,
    precision: 0,
  },
)

const emits = defineEmits<{
  'update:modelValue': [number]
}>()

const modelValue = useModelValue(props, emits)

const decreaseDisabled = computed(() => props.disabled || modelValue.value <= props.min)
const increaseDisabled = computed(() => props.disabled || modelValue.value >= props.max)

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

const allowedRegex = computed(() => props.scientific ? SCIENCE_NUMERIC_REGEX : FLOATING_REGEX)

function toPrecision(value: number, precision: number) {
  if (!Number.isFinite(value)) {
    return value
  }
  const p = Math.max(0, precision ?? 0)
  const factor = 10 ** p
  // 避免浮点误差
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
  if (modelValue.value >= props.max) {
    return
  }

  const next = toPrecision(modelValue.value + props.step, props.precision)
  modelValue.value = clampToRange(next)
}

function decreaseValue() {
  if (modelValue.value <= props.min) {
    return
  }

  const next = toPrecision(modelValue.value - props.step, props.precision)
  modelValue.value = clampToRange(next)
}

function numberParser(value: string) {
  if (value === '') {
    return ''
  }

  const parsed = Number.parseFloat(value)

  if (Number.isNaN(parsed)) {
    return 0
  }

  const rounded = toPrecision(parsed, props.precision)
  return clampToRange(rounded)
}

// 用于原生 input 的显示格式化：保留尾随 0
function numberFormatter(value: Nullable<Numeric>) {
  if ([null, undefined, ''].includes(value as string)) {
    return ''
  }

  const number = typeof value === 'number' ? value : Number.parseFloat(String(value))

  if (Number.isNaN(number)) {
    return ''
  }

  const { precision } = props

  const rounded = toPrecision(number, precision)
  return rounded.toFixed(Math.max(0, precision))
}

const ALLOWED_KEY = [
  'Backspace',
  'Delete',
  'Tab',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
]

function onInputKeydown(ev: KeyboardEvent) {
  if (props.readonly || props.disabled) {
    return
  }

  const key = ev.key

  if (!props.scientific && ['e', 'E'].includes(key)) {
    ev.preventDefault()
    return
  }

  if (!allowedRegex.value.test(key) && !ALLOWED_KEY.includes(key) && !ev.ctrlKey && !ev.metaKey) {
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
</script>

<template>
  <PInput
    v-bind="$attrs"
    v-model="modelValue"
    inputmode="decimal"
    :min="min"
    :max="max"
    align="center"
    input-type="number"
    :disabled="disabled"
    :readonly="readonly"
    :prefix-style="false"
    :suffix-style="false"
    :parser="numberParser"
    :formatter="numberFormatter"
    @keydown="onInputKeydown"
  >
    <template #prefix>
      <button
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center text-foreground-secondary outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="decreaseDisabled"
        @pointerdown="startDecrease"
        @pointercancel="stopDecrease"
        @pointerup="stopDecrease"
        @contextmenu.prevent
      >
        <MinusIcon class="pointer-events-none" />
      </button>

      <span v-if="$slots.prefix" class="ml-1 text-foreground">
        <slot name="prefix" />
      </span>
    </template>

    <template #suffix>
      <span v-if="$slots.suffix" class="mr-1 text-foreground">
        <slot name="suffix" />
      </span>

      <button
        class="flex aspect-square h-full cursor-pointer touch-manipulation appearance-none items-center justify-center text-foreground-secondary outline-none enabled:hover:bg-background-hover enabled:hover:text-gray-1000 enabled:active:bg-background-active disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-700 motion-safe:transition-colors"
        :disabled="increaseDisabled"
        @pointerdown="startIncrease"
        @pointercancel="stopIncrease"
        @pointerup="stopIncrease"
        @contextmenu.prevent
      >
        <PlusIcon class="pointer-events-none" />
      </button>
    </template>
  </PInput>
</template>
