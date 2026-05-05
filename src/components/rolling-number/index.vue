<script lang="ts" setup>
import type { RollingNumberEmits, RollingNumberProps } from './types'
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { caf, raf } from '../../utils/event'

defineOptions({
  name: 'PRollingNumber',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<RollingNumberProps>(), {
  value: 0,
  durations: 1500,
  separator: false,
})

const emits = defineEmits<RollingNumberEmits>()

let rafId = -1
let startTime = -1
let startValue = 0
let targetValue = 0

const displayValue = ref(0)

const decimalPlaces = computed(() => {
  const str = String(props.value)

  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return 0
  }
  return Math.min(str.length - dotIndex - 1, 10)
})

const formattedValue = computed(() => {
  // resolve -0
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
  (newVal) => {
    startAnimation(newVal ?? 0)
  },
  { immediate: true },
)

onBeforeUnmount(() => {
  stopAnimation()
})

defineExpose({
  displayValue,
  formattedValue,
})
</script>

<template>
  <div
    class="pxd-rolling-number inline-flex w-fit items-center leading-none tabular-nums"
    role="status"
    v-bind="$attrs"
  >
    <span class="pxd-rolling-number--value" aria-live="polite" aria-atomic="true">
      {{ formattedValue }}
    </span>
  </div>
</template>
