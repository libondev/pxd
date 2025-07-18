# Carousel
Loop a series of images or texts in a limited space.

## Default

```vue demo
<template>
  <PStack>
    <PCarouselGroup>
      <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarousel>
    </PCarouselGroup>
    <PCarouselGroup direction="vertical">
      <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarousel>
    </PCarouselGroup>
  </PStack>
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

## Disable autoplay and loop
```vue demo
<template>
  <PCarouselGroup :autoplay="false" :loop="false">
    <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarousel>
  </PCarouselGroup>
</template>
```

## Disable indicator
```vue demo
<template>
  <PCarouselGroup :indicator="false">
    <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarousel>
  </PCarouselGroup>
</template>
```

## Disable wheel toggle
By default, it can be switched by the scroll wheel.

```vue demo
<template>
  <PCarouselGroup :toggle-on-wheel="false">
    <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarousel>
  </PCarouselGroup>
</template>
```

## Disable pause on hover
By default, it will pause when the mouse is over the carousel.

```vue demo
<template>
  <PCarouselGroup :pause-on-hover="false">
    <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarousel>
  </PCarouselGroup>
</template>
```
