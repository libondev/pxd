# Carousel

Loop a series of images or texts in a limited space.

## Default

```vue demo
<template>
  <PStack>
    <PCarousel>
      <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarouselItem>
    </PCarousel>

    <PCarousel direction="vertical">
      <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarouselItem>
    </PCarousel>
  </PStack>
</template>

<style>
.pxd-carousel {
  background: var(--color-gray-200);
}
.pxd-carousel:nth-child(2n) {
  background: var(--color-gray-100);
}
</style>
```

## Indicator

```vue demo
<script setup>
import { ref } from 'vue'

const direction = ref('horizontal')
const indicatorType = ref('line')
const indicatorPosition = ref('bottom')
</script>

<template>
  <PStack direction="vertical">
    <PSwitchGroup v-model="direction">
      <PSwitch label="horizontal" value="horizontal" />
      <PSwitch label="vertical" value="vertical" />
    </PSwitchGroup>

    <PSwitchGroup v-model="indicatorType">
      <PSwitch label="dot" value="dot" />
      <PSwitch label="line" value="line" />
    </PSwitchGroup>

    <PSwitchGroup v-model="indicatorPosition">
      <PSwitch label="top" value="top" />
      <PSwitch label="bottom" value="bottom" />
      <PSwitch label="left" value="left" />
      <PSwitch label="right" value="right" />
    </PSwitchGroup>

    <PCarousel
      :direction="direction"
      :indicator-type="indicatorType"
      :indicator-position="indicatorPosition"
    >
      <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarouselItem>
    </PCarousel>

    <PCarousel
      :direction="direction"
      :indicator-type="indicatorType"
      :indicator-position="indicatorPosition"
    >
      <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarouselItem>

      <template #indicator="{ total, current }">
        <span
          class="flex items-center text-xs font-mono py-0.5 px-1.5 rounded-full bg-gray-alpha-200"
        >
          {{ current }}/{{ total }}
        </span>
      </template>
    </PCarousel>
  </PStack>
</template>
```

## Wheel toggle

Use the mouse wheel to switch (if `loop=true` is set, it may cause the cursor to be placed on the carousel and the page cannot be scrolled).

```vue demo
<template>
  <PCarousel toggle-on-wheel>
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarouselItem>
  </PCarousel>
</template>
```

## Disable indicator and arrow

```vue demo
<template>
  <PCarousel :indicator="false" :arrow="false">
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarouselItem>
  </PCarousel>
</template>
```

## Disable autoplay and loop

```vue demo
<template>
  <PCarousel :autoplay="false" :loop="false">
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarouselItem>
  </PCarousel>
</template>
```

## Disable pause on hover

By default, it will pause when the mouse is over the carousel.

```vue demo
<template>
  <PCarousel :pause-on-hover="false">
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarouselItem>
  </PCarousel>
</template>
```
