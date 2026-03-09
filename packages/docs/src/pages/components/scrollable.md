# Scrollable

The container can be scrolled, and the scroll bar or container effect can be customized.

## Default

```vue demo
<template>
  <PScrollable class="w-100 max-w-full h-100 border rounded-md">
    <div class="p-4 w-screen h-screen bg-background-100 rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
      debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
      facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```

## Bottom event

```vue demo
<script setup>
import { ref } from 'vue'

// The end event will not be triggered repeatedly when loading = true
const isLoading = ref(false)

// Start triggering the end event when it is far from the bottom
const bottomThreshold = 50

let resetLoadingTimer = 0

function onScrollToEnd(dir, ev) {
  console.log('to end, direction: ' + dir)

  clearTimeout(resetLoadingTimer)
  isLoading.value = true
  resetLoadingTimer = setTimeout(() => {
    isLoading.value = false
  }, 1000)
}
</script>

<template>
  <PScrollable
    class="w-100 max-w-full h-100 border rounded-md"
    :loading="isLoading"
    :bottom-threshold="bottomThreshold"
    @bottom="onScrollToEnd"
  >
    <div class="p-4 w-screen h-screen bg-background-100 rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
      debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
      facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```

## Stylize

```vue demo
<template>
  <PScrollable
    class="w-100 max-w-full h-100 border rounded-md"
    :fader-size="50"
    fader-color="var(--color-blue-300)"
    scrollbar-color="var(--color-orange-400)"
    scrollbar-hover-color="var(--color-orange-600)"
  >
    <div class="p-4 w-screen h-screen bg-background-100 rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
      debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
      facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```

## Just rolling

Hide scroll edges and scroll bars, leaving only the scrolling function.

```vue demo
<template>
  <PScrollable class="w-100 max-w-full h-100 border rounded-md" :fader="false" :scrollbar="false">
    <div class="p-4 w-screen h-screen bg-background-100 rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias
      debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque
      facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```
