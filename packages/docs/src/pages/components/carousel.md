# Carousel

Loop a series of images or texts in a limited space.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const direction = ref('horizontal')
const indicatorType = ref('dot')
const indicatorPosition = ref('center')
</script>

<template>
  <PStack direction="vertical">
    <PSwitch v-model="direction">
      <PSwitchItem label="horizontal" value="horizontal" />
      <PSwitchItem label="vertical" value="vertical" />
    </PSwitch>

    <PSwitch v-model="indicatorType">
      <PSwitchItem label="dot" value="dot" />
      <PSwitchItem label="line" value="line" />
      <PSwitchItem label="custom" value="custom" />
    </PSwitch>

    <PSwitch v-model="indicatorPosition">
      <PSwitchItem label="center" value="center" />
      <PSwitchItem label="top" value="top" />
      <PSwitchItem label="bottom" value="bottom" />
      <PSwitchItem label="left" value="left" />
      <PSwitchItem label="right" value="right" />
    </PSwitch>

    <PCarousel
      :direction="direction"
      :indicator-type="indicatorType"
      :indicator-position="indicatorPosition"
    >
      <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center bg-gray-200 nth-[2n]:bg-gray-300">
        {{ i }}
      </PCarouselItem>

      <template v-if="indicatorType === 'custom'" #indicator="{ total, current }">
        <span
          class="flex items-center text-xs font-mono py-0.5 px-1.5 rounded-full bg-gray-100"
        >
          {{ current + 1 }}/{{ total }}
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
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center bg-gray-200 nth-[2n]:bg-gray-300">
      {{ i }}
    </PCarouselItem>
  </PCarousel>
</template>
```

## Disable indicator and arrow

```vue demo
<template>
  <PCarousel :indicator="false" :arrow="false">
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center bg-gray-200 nth-[2n]:bg-gray-300">
      {{ i }}
    </PCarouselItem>
  </PCarousel>
</template>
```

## Disable autoplay and loop

```vue demo
<template>
  <PCarousel :autoplay="false" :loop="false">
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center bg-gray-200 nth-[2n]:bg-gray-300">
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
    <PCarouselItem v-for="i in 4" :key="i" class="flex items-center justify-center bg-gray-200 nth-[2n]:bg-gray-300">
      {{ i }}
    </PCarouselItem>
  </PCarousel>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| index | `number` | `0` | - |
| loop | `boolean` | `true` | - |
| arrow | `boolean` | `true` | - |
| height | `number \| string` | `180` | - |
| autoplay | `boolean` | `true` | - |
| interval | `number` | `3000` | - |
| indicator | `boolean` | `true` | - |
| direction | `'horizontal' \| 'vertical'` | `horizontal` | - |
| indicator-type | `'dot' \| 'line'` | `dot` | - |
| indicator-position | `BasePosition \| 'center'` | `center` | - |
| pause-on-hover | `boolean` | `true` | - |
| toggle-on-wheel | `boolean` | - | - |
