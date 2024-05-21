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
      class="h-3 w-full p-.5 box-border select-none touch-none animated data-[state=visible]:animated-fade-in"
      orientation="horizontal"
    >
      <ScrollAreaThumb
        class="relative !h-full bg-primary/25 hover:bg-primary/50 rounded-3 cursor-default before:(content-empty absolute bottom-0 left-0 w-full h-full)"
      />
    </ScrollAreaScrollbar>

    <ScrollAreaScrollbar
      class="w-3 h-full p-.5 box-border select-none touch-none animated data-[state=visible]:animated-fade-in"
      orientation="vertical"
    >
      <ScrollAreaThumb
        class="relative h-full bg-primary/25 hover:bg-primary/50 rounded-3 cursor-default before:(content-empty absolute top-0 right-0 w-full h-full)"
      />
    </ScrollAreaScrollbar>
  </ScrollAreaRoot>
</template>
