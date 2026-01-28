<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { getCssUnitValue, increaseWithUnit } from '../../utils/format'

interface Props {
  loading?: boolean
  animated?: boolean
  width?: string | number
  height?: string | number
  boxHeight?: string | number
  shape?: 'default' | 'squared' | 'rounded'
}

defineOptions({
  name: 'PSkeleton',
})

const props = withDefaults(
  defineProps<Props>(),
  {
    loading: true,
    height: 24,
    shape: 'default',
    animated: true,
  },
)

const computedStyle = computed(() => {
  const { width, height, boxHeight } = props

  const styles = {
    width: getCssUnitValue(width),
    height: getCssUnitValue(height),
  } as CSSProperties

  if (boxHeight) {
    styles['margin-bottom'] = getCssUnitValue(increaseWithUnit(boxHeight, -Number(height)))
  }

  return styles
})

const computedClass = computed(() => {
  const { loading, shape, animated } = props
  const classes = ['pxd-skeleton relative block shrink-0 overflow-hidden']

  if (loading) {
    classes.push('loading invisible')
  }

  if (shape === 'rounded') {
    classes.push('rounded-full')
  } else if (shape === 'squared') {
    classes.push('rounded-none')
  } else {
    classes.push('rounded-md')
  }

  if (animated) {
    classes.push('animated after:default-animation-timing-function!')
  }

  return classes.join(' ')
})
</script>

<template>
  <div :class="computedClass" :style="computedStyle">
    <slot />
  </div>
</template>

<style>
.pxd-skeleton.loading::after {
  content: "";
  position: absolute;
  inset: 0 -200% 0 0;
  visibility: visible;
  background: linear-gradient(90deg, var(--color-gray-100), var(--color-gray-200), var(--color-gray-100)) 0 0 / 50% 100%;
}

.pxd-skeleton.animated::after {
  animation: skeleton-loading 1.5s infinite reverse;
}

@keyframes skeleton-loading {
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
