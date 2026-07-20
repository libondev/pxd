<script lang="ts" setup>
import type { SkeletonProps } from './types'
import type { CSSProperties } from 'vue'
import { computed } from 'vue'
import { useTailwindVariant } from '../../composables/use-tailwind-variant'
import { getCssUnitValue, increaseWithUnit } from '../../utils/format'

defineOptions({
  name: 'PSkeleton',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<SkeletonProps>(), {
  loading: true,
  height: 24,
  shape: 'default',
  animated: true,
})

const { attrs, classes } = useTailwindVariant(
  {
    base: 'pxd-skeleton relative block shrink-0 overflow-hidden',
    variants: {
      loading: {
        true: 'loading invisible content-visibility-auto intrinsic-size-auto',
      },
      shape: {
        default: 'rounded-md',
        square: 'rounded-none',
        rounded: 'rounded-full',
      },
      animated: {
        true: 'animated after:default-animation-timing-function!',
      },
    },
  },
  {
    selection: () => ({
      shape: props.shape,
      loading: props.loading,
      animated: props.animated,
    }),
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
</script>

<template>
  <div :class="classes" :style="computedStyle" v-bind="attrs">
    <slot />
  </div>
</template>

<style>
.pxd-skeleton.loading::after {
  content: '';
  position: absolute;
  inset: 0 -200% 0 0;
  visibility: visible;
  background: linear-gradient(
      90deg,
      var(--color-gray-100),
      var(--color-gray-200),
      var(--color-gray-100)
    )
    0 0 / 50% 100%;
}

.pxd-skeleton.animated::after {
  animation: pxd-animation-skeleton-loading 1.5s infinite reverse;
}

@keyframes pxd-animation-skeleton-loading {
  100% {
    transform: translate3d(-50%, 0, 0);
  }
}
</style>
