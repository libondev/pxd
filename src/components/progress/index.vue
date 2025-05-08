<script lang="ts" setup>
import { computed } from 'vue'
import { useModelValue } from '../../composables/useModelValue'

interface Props {
  max?: number
  label?: string | number | boolean
  variant?: 'default' | 'success' | 'warning' | 'error' | 'secondary'
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
    max: 100,
    label: false,
    variant: 'default',
  },
)

const emits = defineEmits<{
  'update:modelValue': [Props['modelValue']]
}>()

const typeColors = {
  default: 'var(--color-primary)',
  success: 'hsl(var(--blue-700-value))',
  warning: 'hsl(var(--amber-700-value))',
  secondary: 'hsl(var(--gray-700-value))',
  error: 'hsl(var(--red-700-value))',
}

const progressValue = useModelValue(props, emits)

const sortedColorKeys = computed(() => props.colors ? Object.keys(props.colors).map(Number).sort((a, b) => a - b) : [])

const computedColors = computed(() => {
  const { colors, variant } = props

  if (colors) {
    const sortedKeys = sortedColorKeys.value

    for (let i = 0; i < sortedKeys.length; i++) {
      if (progressValue.value < sortedKeys[i]) {
        return colors[sortedKeys[i - 1]] || typeColors.default
      }
    }

    return colors[sortedKeys[sortedKeys.length - 1]] || typeColors.default
  }

  if (variant && typeColors[variant]) {
    return typeColors[variant]
  }

  return typeColors.default
})

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
</script>

<template>
  <div class="pxd-progress w-full flex items-center">
    <progress
      class="
        flex-1 h-2.5 rounded-sm overflow-hidden appearance-none align-[unset]
        [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded-sm
        [&::-moz-progress-value]:bg-(--fg) [&::-moz-progress-bar]:rounded-sm [&::-moz-progress-bar]:transition-all
        [&::-webkit-progress-value]:bg-(--fg) [&::-webkit-progress-value]:rounded-sm [&::-webkit-progress-value]:transition-all
      "
      :style="`--fg: ${computedColors}`"
      :value="progressValue"
      :max="max"
    />

    <span v-if="computedLabel || $slots.default" class="text-gray-900 text-sm ml-3 empty:hidden">
      <slot>
        {{ computedLabel }}
      </slot>
    </span>
  </div>
</template>
