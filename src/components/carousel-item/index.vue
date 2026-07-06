<script lang="ts" setup>
import { onBeforeUnmount, onMounted } from 'vue'
import { useCarouselContext } from '../../contexts/carousel'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PCarouselItem',
  inheritAttrs: false,
})

const uniqueId = getUniqueId()
const carouselContext = useCarouselContext()

onMounted(() => {
  carouselContext?.registerCarousel({
    uid: uniqueId,
  })
})

onBeforeUnmount(() => {
  carouselContext?.unregisterCarousel(uniqueId)
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
