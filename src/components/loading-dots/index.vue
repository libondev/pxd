<script lang="ts" setup>
defineOptions({
  name: 'PLoadingDots',
  inheritAttrs: false,
})
</script>

<template>
  <span
    aria-hidden="true"
    aria-label="Loading"
    class="pxd-loading-dots inline-flex items-center text-foreground-secondary"
    v-bind="$attrs"
  >
    <span
      class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-current opacity-20 default-animation-timing-function! motion-reduce:animate-none!"
    />
    <span
      class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-current opacity-50 default-animation-timing-function! motion-reduce:animate-none!"
      style="animation-delay: 0.2s"
    />
    <span
      class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-current opacity-80 default-animation-timing-function! motion-reduce:animate-none!"
      style="animation-delay: 0.4s"
    />
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
