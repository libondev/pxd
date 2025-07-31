# Scrollable
The container can be scrolled, and the scroll bar or container effect can be customized.

```vue demo
<template>
  <PScrollable class="w-100 max-w-full h-100 border rounded-md">
    <div class="p-4 w-screen h-screen bg-background-100 rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```

## Custom Color

```vue demo
<template>
  <PScrollable
    class="w-100 max-w-full h-100 border rounded-md"
    mask-color="var(--color-pink-400)"
    scrollbarColor="var(--color-red-700)"
    scrollbar-hover-color="var(--color-red-500)"
  >
    <div class="p-4 w-screen h-screen bg-background-100 rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque facere ea, hic incidunt necessitatibus.
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
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```
