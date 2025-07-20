<script lang="ts" setup>
import type { CarouselGroupContext } from '../carousel-group/constants'
import { inject, onBeforeUnmount, shallowRef } from 'vue'
import { getUniqueId } from '../../utils/uid'
import { carouselGroupContextKey } from '../carousel-group/constants'

defineOptions({
  name: 'PCarousel',
})

const carouselGroupContext = inject<CarouselGroupContext>(carouselGroupContextKey)

if (!carouselGroupContext) {
  throw new Error('CarouselGroupContext is not provided')
}

const {
  props,
  carousels,
  registerCarousel,
  unregisterCarousel,
} = carouselGroupContext

const uniqueId = getUniqueId()

const transformStyle = shallowRef('')

function resetPosition() {
  transformStyle.value = ''
}

function getTranslateStyle(translate: number) {
  return props.direction === 'horizontal'
    ? `translateX(${translate}%)`
    : `translateY(${translate}%)`
}

function translateItem(index: number, activeIndex: number) {
  const maxLength = carousels.value.length
  const lastIndex = maxLength - 1

  if (index === 0 && activeIndex === maxLength) {
    // 正向切换：第一个项目移到最右侧
    transformStyle.value = getTranslateStyle(maxLength * 100)
  } else if (index === lastIndex && activeIndex <= 0) {
    // 反向切换：最后一个项目移到最左侧
    transformStyle.value = getTranslateStyle(-maxLength * 100)
  } else {
    resetPosition()
  }
}

registerCarousel({
  uid: uniqueId,
  translateItem,
})

onBeforeUnmount(() => {
  unregisterCarousel(uniqueId)
})
</script>

<template>
  <div class="pxd-carousel w-full h-full shrink-0" :style="{ transform: transformStyle }">
    <slot />
  </div>
</template>
