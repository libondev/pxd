<script lang="ts" setup>
import { computed } from 'vue'
import { useModelValue } from '../../composables/useModelValue'

interface Props {
  max?: number
  type?: 'default' | 'success' | 'warning' | 'error' | 'secondary'
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
    type: 'default',
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

const progressColor = computed(() => {
  const { colors, type } = props

  if (colors) {
    const sortedKeys = sortedColorKeys.value

    for (let i = 0; i < sortedKeys.length; i++) {
      if (progressValue.value < sortedKeys[i]) {
        return colors[sortedKeys[i - 1]] || typeColors.default
      }
    }

    return colors[sortedKeys[sortedKeys.length - 1]] || typeColors.default
  }

  if (type && typeColors[type]) {
    return typeColors[type]
  }

  return typeColors.default
})
</script>

<template>
  <progress
    class="
      pxd-progress block w-full h-2 rounded-sm overflow-hidden appearance-none align-[unset]
      [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded-sm
      [&::-moz-progress-value]:bg-(--fg) [&::-moz-progress-bar]:rounded-sm [&::-moz-progress-bar]:transition-all
      [&::-webkit-progress-value]:bg-(--fg) [&::-webkit-progress-value]:rounded-sm [&::-webkit-progress-value]:transition-all
    "
    :style="`--fg: ${progressColor}`"
    :value="progressValue"
    :max="max"
  />
</template>
