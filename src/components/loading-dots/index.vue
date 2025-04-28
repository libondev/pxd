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

    <span class="pxd-loading--dot mx-px size-[calc(1em/4)] motion-reduce:opacity-20 rounded-full bg-gray-900" />
    <span class="pxd-loading--dot mx-px size-[calc(1em/4)] motion-reduce:opacity-50 rounded-full bg-gray-900" style="animation-delay:.2s" />
    <span class="pxd-loading--dot mx-px size-[calc(1em/4)] motion-reduce:opacity-80 rounded-full bg-gray-900" style="animation-delay:.4s" />

    <div v-if="$slots.suffix" class="pxd-loading-dots--text ml-3">
      <slot name="suffix" />
    </div>
  </span>
</template>

<style>
@keyframes fade-loading {
  0%,100% { opacity: 0.2 }
  20% { opacity: 1 }
}

@media (prefers-reduced-motion: no-preference) {
  .pxd-loading-dots .pxd-loading--dot {
    animation: fade-loading 1.4s infinite ease-in-out;
  }
}
</style>
