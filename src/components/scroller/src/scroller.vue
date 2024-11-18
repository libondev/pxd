<script lang="ts" setup>
import {
  ScrollAreaRoot,
  ScrollAreaScrollbar,
  ScrollAreaThumb,
  ScrollAreaViewport,
} from 'radix-vue'

defineOptions({
  name: 'PScrollbar',
})
</script>

<template>
  <ScrollAreaRoot class="overflow-hidden pr-3 pb-3">
    <ScrollAreaViewport class="w-full h-full">
      <slot />
    </ScrollAreaViewport>

    <ScrollAreaScrollbar
      class="h-3 w-full p-0.5 box-border select-none touch-none animated data-[state=visible]:animated-fade-in"
      orientation="horizontal"
    >
      <ScrollAreaThumb
        class="relative !h-full bg-gray-alpha-300 hover:bg-gray-alpha-500 rounded-md cursor-default before:content-empty before:absolute before:bottom-0 before:left-0 before:w-full before:h-full"
      />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      class="w-3 h-full p-0.5 box-border select-none touch-none animated data-[state=visible]:animated-fade-in"
      orientation="vertical"
    >
      <ScrollAreaThumb
        class="relative h-full bg-gray-alpha-300 hover:bg-gray-alpha-500 rounded-md cursor-default before:content-empty before:absolute before:right-0 before:left-0 before:w-full before:h-full"
      />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
