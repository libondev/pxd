<script lang="ts" setup>
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useCarouselContext } from '../../contexts/carousel'
import { getUniqueId } from '../../utils/helper'

defineOptions({
  name: 'PCarouselItem',
  inheritAttrs: false,
})

const uniqueId = getUniqueId()
const elRef = shallowRef<HTMLElement>()
const carouselContext = useCarouselContext()

function sync(node?: HTMLElement | null) {
  carouselContext?.registerItem(uniqueId, { uid: uniqueId }, node)
}

sync()

onMounted(() => {
  sync(elRef.value ?? null)
})

onBeforeUnmount(() => {
  carouselContext?.unregisterItem(uniqueId)
})
</script>

<template>
  <div
    ref="elRef"
    class="pxd-carousel-item size-full shrink-0 content-visibility-auto intrinsic-size-auto"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
