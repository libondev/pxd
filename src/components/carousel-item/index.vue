<script lang="ts" setup>
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useCarouselContext } from '../../contexts/carousel'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PCarouselItem',
  inheritAttrs: false,
})

const uniqueId = getUniqueId()

const transformStyle = shallowRef('')

const carouselContext = useCarouselContext()

function resetPosition() {
  transformStyle.value = ''
}

function getTranslateStyle(translate: number) {
  const isHorizontal = carouselContext.props.direction === 'horizontal'

  return `translate${isHorizontal ? 'X' : 'Y'}(${translate}%)`
}

function translateItem(index: number, activeIndex: number) {
  const maxLength = carouselContext.carousels.value.length
  const lastIndex = maxLength - 1

  if (index === 0 && activeIndex === maxLength) {
    // move the first item to the right
    transformStyle.value = getTranslateStyle(maxLength * 100)
  } else if (index === lastIndex && activeIndex <= 0) {
    // move the last item to the left
    transformStyle.value = getTranslateStyle(-maxLength * 100)
  } else {
    resetPosition()
  }
}

onMounted(() => {
  carouselContext?.registerCarousel({
    uid: uniqueId,
    translateItem,
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
