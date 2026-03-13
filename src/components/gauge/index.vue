<script lang="ts" setup>
import ChartActivityIcon from '@gdsicon/vue/chart-activity'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider'
import { getColorByThreshold, getFallbackValue } from '../../utils/get'
import type { GaugeProps } from './types'

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
// 轨道的最小可见长度
const MIN_VISIBLE_TRACK = PROGRESS_BAR_GAP * 2

// 圆的半径和周长
const RADIUS = 42
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

const progressArc = computed(() => {
  if (progress.value === 0 || progress.value === 100) {
    return (progress.value / 100) * CIRCUMFERENCE
  }

  const baseArc = (progress.value / 100) * CIRCUMFERENCE

  // 在 50% 的时候因为增加了额外间隙的原因，
  // 所以视觉上看起来会多一点，所以这里手动修正一下
  const visualCorrection = 8
  return Math.max(0, baseArc - visualCorrection)
})

const progressStatus = computed(() => {
  const _progress = progress.value

  return {
    isComplete: props.indeterminate ? false : _progress >= 100,
    hasProgress: props.indeterminate ? false : _progress > 0,
  }
})

// 判断剩余空间是否足够显示轨道
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

// 计算轨道的弧长和偏移
const trackArc = computed(() => {
  if (!shouldShowTrack.value) {
    return 0
  }

  // 进度为 0 时，显示完整轨道
  if (!progressStatus.value.hasProgress) {
    return CIRCUMFERENCE
  }

  // 否则显示剩余部分，减去两个间隙
  return CIRCUMFERENCE - progressArc.value - GAP_LENGTH * 2
})

const trackOffset = computed(() => {
  if (!shouldShowTrack.value || !progressStatus.value.hasProgress) {
    return 0
  }

  // 从进度条结束处算起，加上一个间隙
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
      class="pxd-gauge--svg block size-(--gauge-size) -rotate-85 overflow-visible"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 100 100"
    >
      <circle
        v-if="progressStatus.hasProgress"
        cx="50"
        cy="50"
        fill="none"
        :r="RADIUS"
        stroke-width="10"
        stroke-dashoffset="0"
        stroke-linecap="round"
        :stroke="progressColors.primary"
        class="pxd-gauge--bar motion-safe:transition-all"
        :stroke-dasharray="`${progressArc} ${CIRCUMFERENCE}`"
      />

      <circle
        v-if="shouldShowTrack"
        cx="50"
        cy="50"
        fill="none"
        :r="RADIUS"
        stroke-width="10"
        stroke-linecap="round"
        :stroke-dashoffset="trackOffset"
        :stroke="progressColors.secondary"
        class="pxd-gauge--track motion-safe:transition-all"
        :stroke-dasharray="progressStatus.hasProgress ? `${trackArc} ${CIRCUMFERENCE}` : undefined"
      />
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
