<script lang="ts" setup>
import type { ProgressProps } from './types'
import { computed } from 'vue'
import { useAgentNode } from '../../composables/_internal/use-agent-node.js'
import { useTailwindVariant } from '../../composables/_internal/use-tailwind-variant.js'
import { VARIANT_COLORS } from '../../constants/variant-colors.js'
import { useConfigProvider } from '../../contexts/config-provider.js'
import { isTruthyProp } from '../../utils/format.js'
import { getColorByThreshold } from '../../utils/helper.js'

defineOptions({
  name: 'PProgress',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ProgressProps>(), {
  min: 0,
  max: 100,
  label: false,
  variant: 'primary',
})

const progress = computed(() => props.modelValue || 0)

const computedLabel = computed(() => {
  const { label } = props

  if (isTruthyProp(label)) {
    return String(progress.value)
  }

  if (typeof label === 'string' && label) {
    return label
  }

  return false
})
const relativeProgress = computed(() => progress.value - props.min)

const percentage = computed(() => {
  const range = props.max - props.min
  return range > 0 ? (relativeProgress.value / range) * 100 : 0
})

const computedColors = computed(() => {
  const { colors, variant } = props

  if (colors) {
    return getColorByThreshold(percentage.value, colors) || VARIANT_COLORS[variant]
  }

  return VARIANT_COLORS[variant]
})

const computedProgressBarStyles = computed(() => {
  return {
    width: `${percentage.value}%`,
    backgroundColor: computedColors.value || VARIANT_COLORS.primary,
  }
})

const configProvider = useConfigProvider()
const { classes } = useTailwindVariant(
  {
    base: 'pxd-progress-bar flex-1 shrink-0 overflow-hidden rounded-full bg-gray-200',
    variants: {
      size: {
        sm: 'h-2',
        md: 'h-2.5',
        lg: 'h-3.5',
      },
    },
  },
  {
    mergeAttrsClass: false,
    selection: () => ({ size: props.size || configProvider.size }),
  },
)

useAgentNode({
  name: 'progress',
  state: () => ({
    value: progress.value,
    min: props.min,
    max: props.max,
    percentage: Math.round(percentage.value),
  }),
  actions: {},
})
</script>

<template>
  <div
    data-progress
    role="progressbar"
    class="pxd-progress flex w-full items-center"
    :aria-valuenow="progress!"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :data-variant="variant"
    v-bind="$attrs"
  >
    <div :class="classes">
      <div
        class="h-full rounded-inherit motion-safe:transition-appearance"
        :style="computedProgressBarStyles"
      />
    </div>

    <span
      v-if="computedLabel || $slots.default"
      class="text-sm ms-3 font-mono text-foreground-secondary empty:hidden"
    >
      <slot>
        {{ computedLabel }}
      </slot>
    </span>
  </div>
</template>
