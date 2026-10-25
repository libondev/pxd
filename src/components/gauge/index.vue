<script lang="ts" setup>
import type { GaugeProps } from './types'
import ChartActivityIcon from '@gdsicon/vue/chart-activity'
import { computed } from 'vue'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { getColorByThreshold, getFallbackValue } from '../../utils/helper.js'

defineOptions({
  name: 'PGauge',
  inheritAttrs: false,
  model: {
    prop: 'modelValue',
    event: 'update:model-value',
  },
})

const props = withDefaults(defineProps<GaugeProps>(), {
  modelValue: 60,
  showValue: false,
})

const SIZES = {
  xs: '16',
  sm: '32',
  md: '64',
  lg: '128',
}

const PROGRESS_BAR_GAP = 5

const RADIUS = 42
const CIRCUMFERENCE = 2 * Math.PI * RADIUS
const GAP_LENGTH = (PROGRESS_BAR_GAP / 100) * CIRCUMFERENCE
const GAP_OFFSET = GAP_LENGTH / 2

// `<circle>` starts at 3 o'clock and dashes don't wrap the seam, so trace the ring from 12 o'clock
const RING_PATH =
  `M 50 ${50 - RADIUS} A ${RADIUS} ${RADIUS} 0 1 1 50 ${50 + RADIUS}` +
  ` A ${RADIUS} ${RADIUS} 0 1 1 50 ${50 - RADIUS}`

const DEFAULT_TRACK_COLOR = 'var(--color-gray-alpha-200)'

const defaultColors: GaugeProps['colors'] = {
  0: 'var(--color-red-800)',
  30: 'var(--color-amber-800)',
  60: 'var(--color-green-700)',
}

const progress = computed(() => {
  if (props.indeterminate) {
    return 0
  }

  return Math.min(Math.max(props.modelValue || 0, 0), 100)
})
const isComplete = computed(() => progress.value >= 100)
const hasProgress = computed(() => progress.value > 0)

const strokeWidth = computed(() => (props.size === 'xs' ? 16 : 10))

const bar = computed(() => {
  const arc = (progress.value / 100) * CIRCUMFERENCE

  if (arc === 0 || arc === CIRCUMFERENCE) {
    return { arc, offset: 0 }
  }

  return {
    arc: Math.max(strokeWidth.value / 2, arc - strokeWidth.value),
    offset: -GAP_OFFSET,
  }
})

const track = computed(() => {
  if (isComplete.value || 100 - progress.value < PROGRESS_BAR_GAP * 2) {
    return undefined
  }

  if (!hasProgress.value) {
    return { arc: CIRCUMFERENCE, offset: 0 }
  }

  const { arc } = bar.value

  return { arc: CIRCUMFERENCE - arc - GAP_LENGTH * 2, offset: -arc - GAP_LENGTH - GAP_OFFSET }
})

const progressColors = computed(() => {
  if (props.indeterminate) {
    return { primary: DEFAULT_TRACK_COLOR, secondary: DEFAULT_TRACK_COLOR }
  }

  return {
    primary:
      props.primaryColor || getColorByThreshold(progress.value, props.colors || defaultColors),
    secondary: props.secondaryColor || DEFAULT_TRACK_COLOR,
  }
})

const configProvider = useConfigProvider()

const computedSize = computed(() => getFallbackValue(props.size, SIZES, configProvider.size))
</script>

<template>
  <div
    data-gauge
    role="progressbar"
    class="pxd-gauge relative size-max"
    :style="`--gauge-size: ${computedSize}px`"
    :aria-valuemin="0"
    :aria-valuemax="100"
    :aria-valuenow="indeterminate ? undefined : progress"
    :aria-valuetext="indeterminate ? undefined : `${progress}%`"
    v-bind="$attrs"
  >
    <svg
      class="pxd-gauge--svg block size-(--gauge-size) overflow-visible"
      aria-hidden="true"
      fill="none"
      viewBox="0 0 100 100"
    >
      <path
        v-if="track"
        :d="RING_PATH"
        fill="none"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dashoffset="track.offset"
        :stroke="progressColors.secondary"
        class="pxd-gauge--track motion-safe:transition-[stroke,stroke-dasharray,stroke-dashoffset]"
        :stroke-dasharray="hasProgress ? `${track.arc} ${CIRCUMFERENCE}` : undefined"
      />

      <path
        v-if="hasProgress || isComplete"
        :d="RING_PATH"
        fill="none"
        :stroke-width="strokeWidth"
        :stroke-dashoffset="bar.offset"
        stroke-linecap="round"
        :stroke="progressColors.primary"
        class="pxd-gauge--bar motion-safe:transition-[stroke,stroke-dasharray,stroke-dashoffset]"
        :stroke-dasharray="`${bar.arc} ${CIRCUMFERENCE}`"
      />
    </svg>

    <div
      v-if="indeterminate"
      aria-hidden="true"
      class="pxd-gauge--indeterminate inset-0 font-medium absolute flex items-center justify-center text-center text-foreground-secondary"
      style="font-size: clamp(10px, calc(var(--gauge-size, 48px) * 0.38), 50px)"
    >
      <ChartActivityIcon />
    </div>

    <div
      v-else-if="showValue && computedSize !== SIZES.xs"
      aria-hidden="true"
      class="pxd-gauge--value inset-0 font-medium absolute flex items-center justify-center text-center"
      style="font-size: calc(var(--gauge-size, 48px) * 0.28)"
    >
      {{ progress }}
    </div>
  </div>
</template>
