<script lang="ts" setup>
import type { NoiseBackgroundProps } from './types'
import { computed } from 'vue'
import { getUniqueId } from '../../utils'

defineOptions({
  name: 'PNoiseBackground',
  inheritAttrs: false,
})

const props = withDefaults(defineProps<NoiseBackgroundProps>(), {
  as: 'div',
  color: 'currentColor',
  opacity: 0.035,
})

const filterId = getUniqueId()

const noiseStyle = computed(() => ({
  opacity: props.opacity,
}))
</script>

<template>
  <Component :is="as" class="pxd-noise-background relative" v-bind="$attrs">
    <slot />

    <svg
      aria-hidden="true"
      class="pxd-noise-background--noise inset-0 pointer-events-none absolute size-full rounded-[inherit]"
      preserveAspectRatio="none"
      :style="noiseStyle"
    >
      <filter
        :id="filterId"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        color-interpolation-filters="sRGB"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.8"
          numOctaves="4"
          stitchTiles="stitch"
          result="turbulence"
        />
        <feColorMatrix in="turbulence" type="luminanceToAlpha" result="alpha" />
        <feColorMatrix
          in="alpha"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 18 -8"
          result="contrast"
        />
        <feFlood :flood-color="color" result="flood" />
        <feComposite in="flood" in2="contrast" operator="in" />
      </filter>
      <rect width="100%" height="100%" fill="transparent" :filter="`url(#${filterId})`" />
    </svg>
  </Component>
</template>
