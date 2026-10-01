<script lang="ts" setup>
import { onBeforeUnmount } from 'vue'
import { useCarouselContext } from '../../contexts/carousel.js'

defineOptions({
  name: 'PCarouselItem',
  inheritAttrs: false,
})

const carouselContext = useCarouselContext()

carouselContext?.registerItem()

onBeforeUnmount(() => {
  carouselContext?.unregisterItem()
})
</script>

<template>
  <div
    class="pxd-carousel-item size-full shrink-0 content-visibility-auto intrinsic-size-auto"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
