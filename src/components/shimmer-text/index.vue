<script lang="ts" setup>
import type { ShimmerGradientStop, ShimmerTextProps, ShimmerTextVariant } from './types'
import { computed } from 'vue'

defineOptions({
  name: 'PShimmerText',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<ShimmerTextProps>(), {
  durations: 1500,
  interval: 500,
  color: 'var(--color-gray-100)',
})

const shimmerPresets: Record<ShimmerTextVariant, ShimmerGradientStop[]> = {
  sunrise: [
    { color: '#B6D3EF', position: 0 },
    { color: '#CAD1D7', position: 0.153 },
    { color: '#D7CFC8', position: 0.252 },
    { color: '#E1CDB9', position: 0.341 },
    { color: '#EAC6A5', position: 0.424 },
    { color: '#EDB185', position: 0.505 },
    { color: '#EF9B62', position: 0.586 },
    { color: '#F18F60', position: 0.669 },
    { color: '#F48D7A', position: 0.758 },
    { color: '#F78A94', position: 0.857 },
    { color: '#F888A0', position: 1 },
  ],
  bubble: [
    { color: '#F5EBD9', position: 0 },
    { color: '#F2D4DB', position: 0.31 },
    { color: '#EBBDDE', position: 0.5 },
    { color: '#CCBAE3', position: 0.65 },
    { color: '#8CBFF0', position: 0.82 },
    { color: '#78B0FF', position: 1 },
  ],
  tonic: [
    { color: '#E3EDF0', position: 0 },
    { color: '#E8EBB8', position: 0.27 },
    { color: '#F0DEA3', position: 0.43 },
    { color: '#E8B078', position: 0.75 },
    { color: '#F29682', position: 1 },
  ],
  spring: [
    { color: '#F7D5C5', position: 0.07 },
    { color: '#46A8C0', position: 0.58 },
    { color: '#43AE7D', position: 1 },
  ],
  twilight: [
    { color: '#E3CCE6', position: 0 },
    { color: '#4E8CD5', position: 0.35 },
    { color: '#6068C2', position: 0.64 },
    { color: '#38364E', position: 1 },
  ],
}

const shimmerStyle = computed(() => {
  let backgroundImage: string

  if (Array.isArray(props.color) && props.color.length > 0) {
    backgroundImage = buildBandGradient(props.color)
  } else if (props.variant && props.variant in shimmerPresets) {
    backgroundImage = buildBandGradient(shimmerPresets[props.variant])
  } else {
    backgroundImage = buildDefaultBandGradient(props.color as string)
  }

  return {
    backgroundImage,
    '--shimmer-total-duration': `${props.durations + props.interval}ms`,
  }
})

function buildDefaultBandGradient(color: string = 'var(--color-gray-100)') {
  return buildBandGradient([{ color, position: 0.5 }])
}

function buildBandGradient(stops: ShimmerGradientStop[]) {
  const sorted = [...stops].sort((a, b) => a.position - b.position)
  const first = sorted[0]?.color ?? 'currentColor'
  const last = sorted[sorted.length - 1]?.color ?? 'currentColor'
  const core = sorted
    .map((stop) => {
      const factor = (stop.position - 0.5) * 2 * 0.55
      return `${stop.color} calc(50% + var(--shimmer-text-spread-mid) * ${factor.toFixed(4)})`
    })
    .join(', ')

  return [
    `linear-gradient(120deg`,
    `currentColor calc(50% - var(--shimmer-text-spread))`,
    `color-mix(in oklab, currentColor 20%, ${first}) calc(50% - var(--shimmer-text-spread-mid))`,
    core,
    `color-mix(in oklab, currentColor 20%, ${last}) calc(50% + var(--shimmer-text-spread-mid))`,
    `currentColor calc(50% + var(--shimmer-text-spread)))`,
  ].join(', ')
}
</script>

<template>
  <span
    class="pxd-shimmer-text inline-flex max-w-full bg-transparent bg-clip-text bg-no-repeat motion-reduce:animate-none!"
    :data-variant="variant"
    :style="shimmerStyle"
    v-bind="$attrs"
  >
    <slot>
      {{ text }}
    </slot>
  </span>
</template>

<style>
.pxd-shimmer-text {
  --shimmer-text-spread: 1.5em;
  --shimmer-text-spread-mid: calc(var(--shimmer-text-spread) * 0.68);
  background-size: 300% 100%;
  -webkit-text-fill-color: transparent;
  animation: pxd-animation-shimmer-sweep var(--shimmer-total-duration, 2s)
    cubic-bezier(0.3, 0, 0.2, 1) infinite;
}

@keyframes pxd-animation-shimmer-sweep {
  0% {
    background-position: 100% center;
  }
  70% {
    background-position: 0% center;
    animation-timing-function: step-start;
  }
  100% {
    background-position: 0% center;
  }
}
</style>
