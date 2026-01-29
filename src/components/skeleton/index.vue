<script lang="ts" setup>
import type { CSSProperties } from 'vue'
import type { ComponentShape } from '../../types/shared'
import { computed } from 'vue'
import { getCssUnitValue, increaseWithUnit } from '../../utils/format'
import { skeletonVariant } from './cn'

interface Props {
  loading?: boolean
  animated?: boolean
  width?: string | number
  height?: string | number
  boxHeight?: string | number
  shape?: ComponentShape
}

defineOptions({
  name: 'PSkeleton',
  inheritAttrs: false,
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

const computedClasses = computed(() => {
  return skeletonVariant({
    shape: props.shape,
    loading: props.loading,
    animated: props.animated,
  })
})
</script>

<template>
  <div :class="computedClasses" :style="computedStyle" v-bind="$attrs">
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
