<script lang="ts" setup>
defineOptions({
  name: 'PSpinner',
  inheritAttrs: false,
})

const ITEMS_COUNT = 12
const ROTATE_STEP = 360 / ITEMS_COUNT
const OPACITY_STEP = 1 / ITEMS_COUNT
const ITEMS = Array.from({ length: ITEMS_COUNT }, (_, k) => {
  const step = k + 1

  return {
    left: '38%',
    top: '46%',
    width: '24%',
    height: '8%',
    opacity: step * OPACITY_STEP,
    transform: `rotate(${step * ROTATE_STEP}deg) translate(146%)`,
  }
})
</script>

<template>
  <span
    data-spinner
    aria-hidden="true"
    class="pxd-spinner leading-0 transform-origin-center motion-safe:animate-spin pointer-events-none relative inline-block size-em shrink-0 overflow-hidden content-visibility-auto intrinsic-size-auto"
    v-bind="$attrs"
  >
    <span class="pxd-spinner-container top-0 left-0 absolute size-full">
      <span
        v-for="(item, index) in ITEMS"
        :key="index"
        class="pxd-spinner-item absolute rounded-sm bg-current"
        :style="item"
      />
    </span>
  </span>
</template>

<style>
@layer components {
  [data-spinner] {
    color: var(--color-foreground-secondary);
  }
}
</style>
