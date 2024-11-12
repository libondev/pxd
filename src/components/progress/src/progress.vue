<script lang="ts" setup>
interface ProgressProps {
  max?: number
  type?: 'default' | 'success' | 'warning' | 'error' | 'secondary'
  colors?: Record<string, string>
}

defineOptions({
  name: 'PProgress',
})

const props = withDefaults(
  defineProps<ProgressProps>(),
  {
    max: 100,
    type: 'default',
  },
)

const progressValue = defineModel<number>({ default: 50 })

const typeColors = {
  default: 'hsl(var(--p-gray-1000-value))',
  success: 'hsl(var(--p-blue-700-value))',
  warning: 'hsl(var(--p-amber-700-value))',
  secondary: 'hsl(var(--p-gray-700-value))',
  error: 'hsl(var(--p-red-700-value))',
}

const sortedColorKeys = computed(() => props.colors ? Object.keys(props.colors).map(Number).sort((a, b) => a - b) : [])

const progressColor = computed(() => {
  if (props.colors) {
    const sortedKeys = sortedColorKeys.value

    for (let i = 0; i < sortedKeys.length; i++) {
      if (progressValue.value < sortedKeys[i]) {
        return props.colors[sortedKeys[i - 1]]
      }
    }

    return props.colors[sortedKeys[sortedKeys.length - 1]]
  }

  if (props.type && typeColors[props.type]) {
    return typeColors[props.type]
  }

  return typeColors.default
})
</script>

<template>
  <progress
    class="
      pxd-progress block w-full h-2 rounded overflow-hidden appearance-none align-[unset]
      [&::-webkit-progress-bar]:bg-gray-200 [&::-webkit-progress-bar]:rounded
      [&::-moz-progress-value]:bg-[--fg] [&::-moz-progress-bar]:rounded [&::-moz-progress-bar]:transition-all
      [&::-webkit-progress-value]:bg-[--fg] [&::-webkit-progress-value]:rounded [&::-webkit-progress-value]:transition-all
    "
    :style="`--fg: ${progressColor}`"
    :value="progressValue" :max="max"
  />
</template>
