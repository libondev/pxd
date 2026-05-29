<script lang="ts" setup>
import type { RollingNumberEmits, RollingNumberProps } from './types'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { caf, raf } from '../../utils/event'
import { parseUnitValue } from '../../utils/format'
import { isServer } from '../../utils/is'

defineOptions({
  name: 'PRollingNumber',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<RollingNumberProps>(), {
  value: 0,
  durations: 1000,
  immediate: true,
  thousands: false,
})

const emits = defineEmits<RollingNumberEmits>()

let rafId = -1
let startTime = -1
let startValue = 0
let targetValue = 0

const displayValue = ref(0)

const parsedValueWithUnit = computed(() => parseUnitValue(props.value))

const decimalPlaces = computed(() => {
  const str = String(props.value)

  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return 0
  }

  return Math.min(str.length - dotIndex - 1, 10)
})

const formattedValue = computed(() => {
  // avoid -0
  const d = decimalPlaces.value
  const raw = Math.abs(displayValue.value) < 5 * 10 ** -(d + 1) ? 0 : displayValue.value
  const val = raw.toFixed(d)

  if (!props.thousands) {
    return val
  }

  const [intPart, decPart] = val.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return decPart !== undefined ? `${formatted}.${decPart}` : formatted
})

function easeOutCubic(t: number): number {
  return 1 - (1 - t) ** 3
}

function stopAnimation() {
  caf(rafId)
  rafId = -1
  startTime = -1
}

function animate(timestamp: number) {
  if (startTime < 0) {
    startTime = timestamp
  }

  const elapsed = timestamp - startTime
  const progress = Math.min(elapsed / props.durations, 1)
  const eased = easeOutCubic(progress)

  displayValue.value = startValue + (targetValue - startValue) * eased

  if (progress < 1) {
    rafId = raf(animate)
  } else {
    displayValue.value = targetValue
    rafId = -1
    emits('finish')
  }
}

function startAnimation(target: number) {
  stopAnimation()
  startValue = displayValue.value
  targetValue = target
  startTime = -1

  if (props.durations <= 0) {
    displayValue.value = target
    emits('finish')
    return
  }

  rafId = raf(animate)
}

watch(
  () => props.value,
  () => {
    startAnimation(parsedValueWithUnit.value.number)
  },
)

onMounted(() => {
  if (isServer()) {
    return
  }

  const numberValue = parsedValueWithUnit.value.number

  if (props.immediate) {
    startAnimation(numberValue)
  } else {
    displayValue.value = numberValue
  }
})

onBeforeUnmount(() => {
  stopAnimation()
})

defineExpose({
  displayValue,
  formattedValue,
})
</script>

<template>
  <span
    class="pxd-rolling-number"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    v-bind="$attrs"
  >
    {{ formattedValue }}{{ parsedValueWithUnit.unit }}
  </span>
</template>
