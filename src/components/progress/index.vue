<script lang="ts" setup>
import type { ComponentSize, ComponentVariant } from '../../types/components'
import { computed } from 'vue'
import { useConfigProvider } from '../../composables/useConfigProviderContext'
import { useModelValue } from '../../composables/useModelValue'

interface Props {
  min?: number
  max?: number
  size?: ComponentSize
  label?: string | number | boolean
  variant?: ComponentVariant | 'secondary'
  colors?: Record<string, string>
  modelValue: number
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
  'update:modelValue': [Props['modelValue']]
}>()

const config = useConfigProvider()

const SIZES = {
  sm: 'h-2',
  md: 'h-2.5',
  lg: 'h-3.5',
}

const VARIANTS_COLORS = {
  primary: 'var(--color-primary)',
  success: 'hsl(var(--blue-700-value))',
  warning: 'hsl(var(--amber-700-value))',
  secondary: 'hsl(var(--gray-700-value))',
  error: 'hsl(var(--red-700-value))',
}

const progressValue = useModelValue(props, emits)

const sortedColorKeys = computed(() => props.colors ? Object.keys(props.colors).map(Number).sort((a, b) => a - b) : [])

const computedLabel = computed(() => {
  const { label } = props

  // hack vue2 boolean value
  if (label === true || label === '') {
    return String(progressValue.value)
  }

  if (typeof label === 'string' && label) {
    return label
  }

  return false
})

const computedColors = computed(() => {
  const { colors, variant } = props

  if (colors) {
    const sortedKeys = sortedColorKeys.value

    for (let i = 0; i < sortedKeys.length; i++) {
      if (progressValue.value < sortedKeys[i]) {
        return colors[sortedKeys[i - 1]]
      }
    }

    return colors[sortedKeys[sortedKeys.length - 1]]
  }

  return VARIANTS_COLORS[variant]
})

const computedProgressBarStyles = computed(() => {
  const { min, max } = props

  return {
    width: `${(progressValue.value / (max - min)) * 100}%`,
    backgroundColor: computedColors.value || VARIANTS_COLORS.primary,
  }
})
</script>

<template>
  <div role="progressbar" class="pxd-progress w-full flex items-center" :aria-valuenow="progressValue" :aria-valuemin="min" :aria-valuemax="max">
    <div class="flex-1 rounded-full overflow-hidden bg-gray-200" :class="SIZES[size || config.size]">
      <div class="h-full rounded-inherit motion-safe:transition-all" :style="computedProgressBarStyles" />
    </div>

    <span v-if="computedLabel || $slots.default" class="text-gray-900 text-sm ml-3 font-mono empty:hidden">
      <slot>
        {{ computedLabel }}
      </slot>
    </span>
  </div>
</template>
