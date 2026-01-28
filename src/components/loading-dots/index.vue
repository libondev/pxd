<script setup lang="ts">
defineOptions({
  name: 'PLoadingDots',
})
</script>

<template>
  <span class="pxd-loading-dots inline-flex items-center">
    <div v-if="$slots.prefix" class="pxd-loading-dots--text mr-3">
      <slot name="prefix" />
    </div>

    <span class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-gray-900 default-animation-timing-function! motion-safe:animate-[fade-loading_1.4s_infinite] motion-reduce:opacity-20" />
    <span class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-gray-900 default-animation-timing-function! motion-safe:animate-[fade-loading_1.4s_infinite] motion-reduce:opacity-50" style="animation-delay:.2s" />
    <span class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-gray-900 default-animation-timing-function! motion-safe:animate-[fade-loading_1.4s_infinite] motion-reduce:opacity-80" style="animation-delay:.4s" />

    <div v-if="$slots.suffix" class="pxd-loading-dots--text ml-3">
      <slot name="suffix" />
    </div>
  </span>
</template>

<style>
@keyframes fade-loading {
  0%,100% { opacity: 0.2 }
  20% { opacity: .8 }
}
</style>
