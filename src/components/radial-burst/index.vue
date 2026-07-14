<script setup lang="ts">
import type { RadialBurstProps } from './types'
import { computed, type CSSProperties } from 'vue'
import { getCssUnitValue } from '../../utils/format'

defineOptions({
  name: 'PRadialBurst',
  inheritAttrs: false,
})

const props = defineProps<RadialBurstProps>()

const wrapperStyle = computed<CSSProperties>(() => {
  return {
    'background-color': props.backgroundColor,
  }
})

const containerStyle = computed<CSSProperties>(() => {
  return {
    'inline-size': getCssUnitValue(props.size),
    '--radial-burst-color-accent': props.primaryColor,
  }
})
</script>

<template>
  <div
    class="pxd-radial-burst min-h-40 bg-yellow-300 relative flex w-full max-w-full items-center justify-center overflow-hidden"
    :style="wrapperStyle"
    v-bind="$attrs"
  >
    <div
      class="pxd-radial-burst--container motion-safe:animate-spin pointer-events-none absolute z-0 aspect-square -translate-x-1/2 -translate-y-1/2"
      :style="containerStyle"
    ></div>

    <div class="pxd-radial-burst--content relative z-1 w-max">
      <slot />
    </div>
  </div>
</template>

<style>
.pxd-radial-burst--container {
  --radial-burst-color-accent: var(--color-yellow-400);
  inset: 50% auto auto 50%;
  inline-size: 150%;
  animation-duration: 30s;
  background-image:
    repeating-conic-gradient(
      transparent 0,
      transparent 13deg,
      var(--radial-burst-color-accent) 13deg,
      var(--radial-burst-color-accent) 16deg
    ),
    repeating-conic-gradient(
      transparent 0,
      transparent 20deg,
      var(--radial-burst-color-accent) 20deg,
      var(--radial-burst-color-accent) 23deg
    ),
    repeating-conic-gradient(
      transparent 0,
      transparent 5deg,
      var(--radial-burst-color-accent) 5deg,
      var(--radial-burst-color-accent) 8deg
    ),
    repeating-conic-gradient(
      transparent 0,
      transparent 40deg,
      var(--radial-burst-color-accent) 40deg,
      var(--radial-burst-color-accent) 44deg
    ),
    repeating-conic-gradient(
      transparent 0,
      transparent 10deg,
      var(--radial-burst-color-accent) 10deg,
      var(--radial-burst-color-accent) 13deg
    );
  mask-image: radial-gradient(transparent 0px, transparent 12%, white 30%);
}
</style>
