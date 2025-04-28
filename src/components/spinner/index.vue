<script setup lang="ts">
defineOptions({
  name: 'PSpinner',
})

const ITEMS_COUNT = 12
const ROTATE_STEP = 360 / ITEMS_COUNT
const OPACITY_STEP = 1 / ITEMS_COUNT
</script>

<template>
  <div class="pxd-spinner relative text-gray-700 overflow-hidden pointer-events-none size-em transform-origin-center motion-safe:animate-spin">
    <div class="pxd-spinner-container absolute w-full h-full top-0 left-0">
      <div
        v-for="i of ITEMS_COUNT"
        :key="i"
        class="pxd-spinner-item absolute rounded-sm bg-current"
        :style="{ opacity: i * OPACITY_STEP, transform: `rotate(${i * ROTATE_STEP}deg) translate(146%)` }"
      />
    </div>
  </div>
</template>

<style>
.pxd-spinner-item {
  left: 38%;
  top: 46%;
  width: 24%;
  height: 8%;
}
</style>
