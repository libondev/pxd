# Carousel
Loop a series of images or texts in a limited space.

## Default

```vue demo
<template>
  <PCarouselGroup height="150">
    <PCarousel v-for="i in 5" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarousel>
  </PCarouselGroup>
</template>

<style>
.pxd-carousel {
  background: var(--color-gray-200)
}
.pxd-carousel:nth-child(2n) {
  background: var(--color-gray-100)
}
</style>
```
