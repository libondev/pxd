<script lang="ts" setup>
import { onBeforeUnmount, onMounted, computed, shallowRef } from 'vue'
import { useCarouselContext } from '../../contexts/carousel'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PCarouselItem',
  inheritAttrs: false,
})

const uniqueId = getUniqueId()

const itemIndex = shallowRef(0)
const carouselContext = useCarouselContext()

const transformStyle = computed(() => {
  if (!carouselContext.props.loop) {
    return ''
  }

  const { carousels, virtualIndex } = carouselContext

  const maxLength = carousels.value.length
  const lastIndex = maxLength - 1
  const activeIndex = virtualIndex.value

  if (itemIndex.value === 0 && activeIndex >= lastIndex) {
    return getTranslateValue(maxLength * 100)
  } else if (itemIndex.value === lastIndex && activeIndex <= 0) {
    return getTranslateValue(-maxLength * 100)
  } else {
    return ''
  }
})

function updateItemIndex(index: number) {
  itemIndex.value = index
}

function getTranslateValue(translate: number) {
  const isHorizontal = carouselContext.props.direction === 'horizontal'

  return `translate${isHorizontal ? 'X' : 'Y'}(${translate}%)`
}

onMounted(() => {
  carouselContext?.registerCarousel({
    uid: uniqueId,
    updateItemIndex,
  })
})

onBeforeUnmount(() => {
  carouselContext?.unregisterCarousel(uniqueId)
})
</script>

<template>
  <div
    class="pxd-carousel-item size-full shrink-0 content-visibility-auto intrinsic-size-auto"
    :style="{ transform: transformStyle }"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
