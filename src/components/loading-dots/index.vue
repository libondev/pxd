<script lang="ts" setup>
defineOptions({
  name: 'PLoadingDots',
  inheritAttrs: false,
})

const DOT_CLASS =
  'pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-current default-animation-timing-function! motion-reduce:animate-none!'
</script>

<template>
  <span
    data-loading-dots
    aria-hidden="true"
    class="pxd-loading-dots inline-flex items-center text-foreground-secondary"
    v-bind="$attrs"
  >
    <span :class="[DOT_CLASS, 'opacity-20']" />
    <span :class="[DOT_CLASS, 'opacity-50']" style="animation-delay: 0.2s" />
    <span :class="[DOT_CLASS, 'opacity-80']" style="animation-delay: 0.4s" />
  </span>
</template>

<style>
.pxd-loading--dot {
  animation: pxd-animation-fade-loading 1.4s infinite;
}

@keyframes pxd-animation-fade-loading {
  0%,
  100% {
    opacity: 0.2;
  }
  20% {
    opacity: 0.9;
  }
}
</style>
