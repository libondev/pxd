<script lang="ts" setup>
defineOptions({
  name: 'PLoadingDots',
  inheritAttrs: false,
})
</script>

<template>
  <span class="pxd-loading-dots inline-flex items-center" v-bind="$attrs">
    <span
      class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-gray-900 opacity-20 default-animation-timing-function! motion-reduce:animate-none!"
    />
    <span
      class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-gray-900 opacity-50 default-animation-timing-function! motion-reduce:animate-none!"
      style="animation-delay: 0.2s"
    />
    <span
      class="pxd-loading--dot mx-px size-[calc(1em/4)] rounded-full bg-gray-900 opacity-80 default-animation-timing-function! motion-reduce:animate-none!"
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
    opacity: 0.8;
  }
}
</style>
