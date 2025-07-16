<script lang="ts" setup>
import type { CarouselGroupContext } from '../carousel-group/constants'
import { inject, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useUniqueId } from '../../composables/useUniqueIdContext'
import { carouselGroupContextKey } from '../carousel-group/constants'

defineOptions({
  name: 'PCarousel',
})

const carouselGroupContext = inject<CarouselGroupContext>(carouselGroupContextKey)

if (!carouselGroupContext) {
  throw new Error('CarouselGroupContext is not provided')
}

const {
  slides,
  registerCarousel,
  unregisterCarousel,
} = carouselGroupContext

const uniqueId = useUniqueId()

const transformStyle = shallowRef('')

function resetPosition() {
  transformStyle.value = ''
}

function translateItem(index: number, activeIndex: number) {
  const maxLength = slides.value.length
  const lastIndex = maxLength - 1

  // 第一个 item 在非激活的情况下需要移动到最右侧以确保可以循环切换
  if (index === 0 && activeIndex === lastIndex) {
    transformStyle.value = `translateX(${maxLength * 100}%)`
  } else {
    resetPosition()
  }
}

onMounted(() => {
  registerCarousel({
    id: uniqueId,
    resetPosition,
    translateItem,
  })
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
