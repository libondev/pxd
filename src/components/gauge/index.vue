<script lang="ts" setup>
import type { GaugeProps } from './types'
import ChartActivityIcon from '@gdsicon/vue/chart-activity'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { getColorByThreshold, getFallbackValue } from '../../utils/helper'

defineOptions({
  name: 'PGauge',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(defineProps<GaugeProps>(), {
  modelValue: 60,
  showValue: false,
})

const SIZES = {
  xs: '24',
  sm: '32',
  md: '64',
  lg: '128',
}

const PROGRESS_BAR_GAP = 5
const MIN_VISIBLE_TRACK = PROGRESS_BAR_GAP * 2

const RADIUS = 42
const STROKE_WIDTH = 10
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_LENGTH = (PROGRESS_BAR_GAP / 100) * CIRCUMFERENCE

const defaultColors: GaugeProps['colors'] = {
  0: 'var(--color-red-800)',
  30: 'var(--color-amber-800)',
  60: 'var(--color-green-700)',
}

const configProvider = useConfigProvider()

const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))

const progress = computed(() => {
  if (props.indeterminate) {
    return 0
  }

  return Math.min(Math.max(props.modelValue || 0, 0), 100)
})

/**
 * 几何弧长按百分比截取；round linecap 会在端点外侧“多出一截”，
 * 略短于几何长度可避免与间隙叠在一起显得过满（旧实现里写死的 8 与此同因）。
 */
const progressArc = computed(() => {
  if (progress.value === 0 || progress.value === 100) {
    return (progress.value / 100) * CIRCUMFERENCE
  }

  const baseArc = (progress.value / 100) * CIRCUMFERENCE
  const roundCapTrim = STROKE_WIDTH

  return Math.max(0, baseArc - roundCapTrim)
})

const progressStatus = computed(() => {
  const _progress = progress.value

  return {
    isComplete: props.indeterminate ? false : _progress >= 100,
    hasProgress: props.indeterminate ? false : _progress > 0,
  }
})

const shouldShowTrack = computed(() => {
  if (progressStatus.value.isComplete) {
    return false
  }

  if (!progressStatus.value.hasProgress) {
    return true
  }

  const remainingPercent = 100 - progress.value
  return remainingPercent >= MIN_VISIBLE_TRACK
})

const trackArc = computed(() => {
  if (!shouldShowTrack.value) {
    return 0
  }

  if (!progressStatus.value.hasProgress) {
    return CIRCUMFERENCE
  }

  return CIRCUMFERENCE - progressArc.value - GAP_LENGTH * 2
})

const trackOffset = computed(() => {
  if (!shouldShowTrack.value || !progressStatus.value.hasProgress) {
    return 0
  }

  return -progressArc.value - GAP_LENGTH
})

const progressColors = computed(() => {
  const colors = props.colors || defaultColors

  let primaryColor = colors.primary
  let secondaryColor = colors.secondary || 'hsl(var(--color-gray-200-value))'

  if (props.indeterminate) {
    primaryColor = 'hsl(var(--color-gray-200-value))'
    secondaryColor = 'hsl(var(--color-gray-200-value))'
  } else if (!primaryColor) {
    primaryColor = getColorByThreshold(progress.value, colors) || colors.primary
  }

  return {
    primary: primaryColor,
    secondary: secondaryColor,
  }
})
</script>

<template>
  <div
    class="pxd-gauge relative size-max"
    :style="`--gauge-size: ${computedSize}px`"
    v-bind="$attrs"
  >
    <svg
      class="pxd-gauge--svg block size-(--gauge-size) overflow-visible"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 100 100"
    >
      <g transform="rotate(-83 50 50)">
        <circle
          v-if="shouldShowTrack"
          cx="50"
          cy="50"
          fill="none"
          :r="RADIUS"
          :stroke-width="STROKE_WIDTH"
          stroke-linecap="round"
          :stroke-dashoffset="trackOffset"
          :stroke="progressColors.secondary"
          class="pxd-gauge--track motion-safe:transition-appearance"
          :stroke-dasharray="
            progressStatus.hasProgress ? `${trackArc} ${CIRCUMFERENCE}` : undefined
          "
        />

        <circle
          v-if="progressStatus.hasProgress || progressStatus.isComplete"
          cx="50"
          cy="50"
          fill="none"
          :r="RADIUS"
          :stroke-width="STROKE_WIDTH"
          stroke-dashoffset="0"
          stroke-linecap="round"
          :stroke="progressColors.primary"
          class="pxd-gauge--bar motion-safe:transition-appearance"
          :stroke-dasharray="`${progressArc} ${CIRCUMFERENCE}`"
        />
      </g>
    </svg>

    <div
      v-if="indeterminate"
      class="pxd-gauge--indeterminate inset-0 font-medium absolute flex items-center justify-center text-center text-foreground-secondary"
      style="font-size: clamp(10px, calc(var(--gauge-size, 48px) * 0.38), 50px)"
    >
      <ChartActivityIcon />
    </div>

    <div
      v-else-if="showValue && size !== 'xs'"
      class="pxd-gauge--value inset-0 font-medium absolute flex items-center justify-center text-center"
      style="font-size: calc(var(--gauge-size, 48px) * 0.28)"
    >
      {{ progress }}
    </div>
  </div>
</template>
