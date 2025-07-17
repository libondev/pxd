<script lang="ts" setup>
import type { ComponentSize, ComponentVariant } from '../../types/components'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { useModelValue } from '../../composables/useModelValue'
import { getColorByThreshold } from '../../utils/colors'
import { isTruthyProp } from '../../utils/format'

interface Props {
  min?: number
  max?: number
  size?: ComponentSize
  label?: boolean | string | number
  variant?: ComponentVariant | 'secondary'
  colors?: Record<string, string>
  modelValue?: number | null
}

defineOptions({
  name: 'PProgress',
  model: {
    prop: 'modelValue',
    event: 'update:modelValue',
  },
})

const props = withDefaults(
  defineProps<Props>(),
  {
    min: 0,
    max: 100,
    label: false,
    variant: 'primary',
  },
)

const emits = defineEmits<{
  'update:modelValue': [NonNullable<Props['modelValue']>]
}>()

const config = useConfigProvider()

const SIZES = {
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3.5',
}

const VARIANTS_COLORS = {
  primary: 'var(--color-primary)',
  success: 'hsl(var(--color-blue-700-value))',
  warning: 'hsl(var(--color-amber-700-value))',
  secondary: 'hsl(var(--color-gray-700-value))',
  error: 'hsl(var(--color-red-700-value))',
}

const progress = useModelValue(props, emits, {
  get: () => props.modelValue || 0,
})

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

const computedColors = computed(() => {
  const { colors, variant } = props

  if (colors) {
    return getColorByThreshold(progress.value, colors) || VARIANTS_COLORS[variant]
  }

  return VARIANTS_COLORS[variant]
})

const computedProgressBarStyles = computed(() => {
  const { min, max } = props

  return {
    width: `${(progress.value / (max - min)) * 100}%`,
    backgroundColor: computedColors.value || VARIANTS_COLORS.primary,
  }
})
</script>

<template>
  <div role="progressbar" class="pxd-progress w-full flex items-center" :aria-valuenow="progress" :aria-valuemin="min" :aria-valuemax="max">
    <div class="flex-1 rounded-full overflow-hidden bg-gray-200" :class="SIZES[size || config.size]">
      <div class="h-full rounded-inherit motion-safe:transition-all" :style="computedProgressBarStyles" />
    </div>

    <span v-if="computedLabel || $slots.default" class="text-foreground-secondary text-sm ml-3 font-mono empty:hidden">
      <slot>
        {{ computedLabel }}
      </slot>
    </span>
  </div>
</template>
