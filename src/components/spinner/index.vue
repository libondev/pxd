<script setup lang="ts">
defineOptions({
  name: 'PSpinner',
})

const ITEMS_COUNT = 12
const ROTATE_STEP = 360 / ITEMS_COUNT
const OPACITY_STEP = 1 / ITEMS_COUNT
</script>

<template>
  <div class="pxd-spinner relative text-gray-700 motion-safe:animate-spin overflow-hidden pointer-events-none size-[1em]">
    <div class="absolute left-1/2 top-1/2 w-full h-full">
      <div
        v-for="i of ITEMS_COUNT"
        :key="i"
        class="pxd-spinner-item absolute rounded bg-current left-[-10%] top-[-3.9%] w-[24%] h-[8%]"
        :style="{ opacity: i * OPACITY_STEP, transform: `rotate(${i * ROTATE_STEP}deg) translate(146%)` }"
      />
    </div>
  </div>
</template>
