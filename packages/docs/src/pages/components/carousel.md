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

    <PCarouselGroup
      :direction="direction"
      :indicator-type="indicatorType"
      :indicator-position="indicatorPosition"
    >
      <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarousel>
    </PCarouselGroup>

    <PCarouselGroup
      :direction="direction"
      :indicator-type="indicatorType"
      :indicator-position="indicatorPosition"
    >
      <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
        {{ i }}
      </PCarousel>

      <template #indicator="{ total, current }">
        <span
          class="flex items-center text-xs font-mono py-0.5 px-1.5 rounded-full bg-gray-alpha-200"
        >
          {{ current }}/{{ total }}
        </span>
      </template>
    </PCarouselGroup>
  </PStack>
</template>
```

## Wheel toggle

Use the mouse wheel to switch (if `loop=true` is set, it may cause the cursor to be placed on the carousel and the page cannot be scrolled).

```vue demo
<template>
  <PCarouselGroup toggle-on-wheel>
    <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarousel>
  </PCarouselGroup>
</template>
```

## Disable indicator and arrow

```vue demo
<template>
  <PCarouselGroup :indicator="false" :arrow="false">
    <PCarousel v-for="i in 4" :key="i" class="flex items-center justify-center">
      {{ i }}
    </PCarousel>
  </PCarouselGroup>
</template>
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
