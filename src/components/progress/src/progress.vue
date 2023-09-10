<script lang="ts" setup>
import { ProgressIndicator, ProgressRoot } from 'radix-vue'

defineOptions({
  name: 'PxProgress'
})

defineProps({
  size: {
    type: String as PropType<Size>,
    default: 'default',
  },

  max: {
    type: Number,
    default: 100,
  },

  direction: {
    type: String as PropType<Direction>,
    default: 'horizontal',
  }
})

const progressValue = defineModel<number>({
  default: 0
})

const SIZE = {
  sm: {
    horizontal: 'w-full h-1',
    vertical: 'w-1 h-full rotate-x-full'
  },
  default: {
    horizontal: 'w-full h-2',
    vertical: 'w-2 h-300px rotate-x-full'
  },
  lg: {
    horizontal: 'w-full h-3',
    vertical: 'w-3 h-full rotate-x-full'
  },
}
</script>

<template>
  <ProgressRoot
    v-model="progressValue"
    class="shadow-sm h-1 overflow-hidden rounded-full bg-input"
    :class="SIZE[size][direction]"
  >
    <ProgressIndicator
      :data-direction="direction"
      class="w-full h-full bg-primary data-[direction=horizontal]:translate-x-$tl data-[direction=vertical]:translate-y-$tl transition-transform"
      :style="`--tl: -${max - progressValue}%`"
    />
  </ProgressRoot>
</template>
