<script lang="ts" setup>
import type { RollingNumberEmits, RollingNumberProps } from './types'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { caf, raf } from '../../utils/event.js'
import { parseUnitValue } from '../../utils/format.js'
import { isServer, isUndefined } from '../../utils/is.js'

defineOptions({
  name: 'PRollingNumber',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<RollingNumberProps>(), {
  value: 0,
  mode: 'tween',
  durations: 2000,
  thousands: false,
  animateOnMount: true,
})

const emits = defineEmits<RollingNumberEmits>()

const DIGIT_LIST = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

let rafId = -1
let startTime = -1
let startValue = 0
let targetValue = 0
let finishTimer: ReturnType<typeof setTimeout> | null = null

const displayValue = ref(0)
const scrollTransition = ref(false)
const scrollText = ref<string | null>(null)

const parsedValueWithUnit = computed(() => parseUnitValue(props.value))

const isScrollMode = computed(() => props.mode === 'scroll')

const decimalPlaces = computed(() => {
  const str = String(props.value)

  const dotIndex = str.indexOf('.')
  if (dotIndex === -1) {
    return 0
  }

  return Math.min(str.length - dotIndex - 1, 10)
})

function formatNumber(rawValue: number): string {
  // avoid -0
  const d = decimalPlaces.value
  const raw = Math.abs(rawValue) < 5 * 10 ** -(d + 1) ? 0 : rawValue
  const val = raw.toFixed(d)

  if (!props.thousands) {
    return val
  }

  const [intPart, decPart] = val.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return isUndefined(decPart) ? formatted : `${formatted}.${decPart}`
}

function maskDigitsAsZero(formatted: string): string {
  return formatted.replace(/\d/g, '0')
}

const formattedValue = computed(() => formatNumber(displayValue.value))

const scrollChars = computed(() => {
  const chars = (scrollText.value ?? formattedValue.value).split('')
  const len = chars.length

  return chars.map((char, index) => {
    const fromRight = len - 1 - index
    const isDigit = char >= '0' && char <= '9'

    return {
      key: isDigit ? `d-${fromRight}` : `s-${fromRight}-${char}`,
      char,
      isDigit,
      digit: isDigit ? Number(char) : 0,
    }
  })
})

const scrollStyle = computed(() => ({
  '--pxd-rolling-duration': `${Math.max(props.durations, 0)}ms`,
}))

function easeOutCubic(t: number): number {
  return t === 1 ? 1 : 1 - 2 ** (-10 * t)
}

function clearFinishTimer() {
  if (finishTimer != null) {
    clearTimeout(finishTimer)
    finishTimer = null
  }
}

function stopAnimation() {
  caf(rafId)
  rafId = -1
  startTime = -1
  clearFinishTimer()
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

function startTweenAnimation(target: number) {
  stopAnimation()
  scrollTransition.value = false
  scrollText.value = null
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

function scheduleScrollFinish() {
  clearFinishTimer()

  finishTimer = setTimeout(() => {
    finishTimer = null
    emits('finish')
  }, props.durations)
}

async function startScrollAnimation(target: number, fromMasked = false) {
  stopAnimation()

  const targetText = formatNumber(target)

  if (props.durations <= 0) {
    scrollTransition.value = false
    scrollText.value = null
    displayValue.value = target
    emits('finish')
    return
  }

  displayValue.value = target

  if (fromMasked) {
    scrollTransition.value = false
    scrollText.value = maskDigitsAsZero(targetText)
    await nextTick()
  }

  scrollTransition.value = true
  scrollText.value = targetText
  scheduleScrollFinish()
}

function startAnimation(target: number) {
  if (isScrollMode.value) {
    startScrollAnimation(target)
    return
  }

  startTweenAnimation(target)
}

watch(
  () => props.value,
  () => {
    startAnimation(parsedValueWithUnit.value.number)
  },
)

watch(
  () => props.mode,
  () => {
    startAnimation(parsedValueWithUnit.value.number)
  },
)

onMounted(() => {
  if (isServer()) {
    return
  }

  const numberValue = parsedValueWithUnit.value.number

  if (props.animateOnMount) {
    if (isScrollMode.value) {
      startScrollAnimation(numberValue, true)
      return
    }

    startAnimation(numberValue)
  } else {
    displayValue.value = numberValue
    scrollText.value = null
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
    class="pxd-rolling-number tabular-nums text-trim-both"
    role="status"
    aria-live="polite"
    aria-atomic="true"
    :style="isScrollMode ? scrollStyle : undefined"
    v-bind="$attrs"
  >
    <template v-if="isScrollMode">
      <span class="pxd-rolling-number--scroll inline-flex items-baseline" aria-hidden="true">
        <template v-for="item in scrollChars" :key="item.key">
          <span
            v-if="item.isDigit"
            class="pxd-rolling-number--digit relative inline-block h-em overflow-hidden align-bottom leading-none"
          >
            <span
              class="pxd-rolling-number--digit-strip inline-flex flex-col will-change-transform"
              :class="{
                'motion-safe:transition-transform motion-safe:duration-(--pxd-rolling-duration)':
                  scrollTransition,
              }"
              :style="{ transform: `translate3d(0, -${item.digit}em, 0)` }"
            >
              <span
                v-for="digit in DIGIT_LIST"
                :key="digit"
                class="inline-block h-em w-full text-center leading-none"
              >
                {{ digit }}
              </span>
            </span>
          </span>
          <span v-else class="inline-block">{{ item.char }}</span>
        </template>
        <span v-if="parsedValueWithUnit.unit">{{ parsedValueWithUnit.unit }}</span>
      </span>
    </template>

    <span :class="{ 'visually-hidden': isScrollMode }">
      {{ formattedValue }}{{ parsedValueWithUnit.unit }}
    </span>
  </span>
</template>
