<script lang="ts" setup>
import { onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useCarouselGroupContext } from '../../contexts/carousel'
import { getUniqueId } from '../../utils/uid'

defineOptions({
  name: 'PCarousel',
  inheritAttrs: false,
})

const uniqueId = getUniqueId()

const transformStyle = shallowRef('')

const carouselGroupContext = useCarouselGroupContext()

function resetPosition() {
  transformStyle.value = ''
}

function getTranslateStyle(translate: number) {
  const isHorizontal = carouselGroupContext.props.direction === 'horizontal'

  return `translate${isHorizontal ? 'X' : 'Y'}(${translate}%)`
}

function translateItem(index: number, activeIndex: number) {
  const maxLength = carouselGroupContext.carousels.value.length
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
  carouselGroupContext?.registerCarousel({
    uid: uniqueId,
    translateItem,
  })
})

onBeforeUnmount(() => {
  carouselGroupContext?.unregisterCarousel(uniqueId)
})
</script>

<template>
  <div
    class="pxd-carousel size-full shrink-0"
    :style="{ transform: transformStyle }"
    v-bind="$attrs"
  >
    <slot />
  </div>
</template>
