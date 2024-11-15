<script setup lang="ts">
interface LoadingDotsProps {
  size?: number
}

defineOptions({
  name: 'PLoadingDots',
})

const { size = 4 } = defineProps<LoadingDotsProps>()
</script>

<template>
  <span class="pxd-loading-dots inline-flex items-center" :style="{ '--size': `${size}px` }">
    <div v-if="$slots.default" class="pxd-loading-dots-text mr-3">
      <slot />
    </div>
    <span class="mx-px w-[--size] h-[--size] animate-fade-loading rounded-full bg-gray-900" />
    <span class="mx-px w-[--size] h-[--size] animate-fade-loading rounded-full bg-gray-900" style="animation-delay:.2s" />
    <span class="mx-px w-[--size] h-[--size] animate-fade-loading rounded-full bg-gray-900" style="animation-delay:.4s" />
  </span>
</template>
