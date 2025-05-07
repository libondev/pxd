# Scrollable
The container can be scrolled, and the scroll bar or container effect can be customized.

```vue demo
<template>
  <PScrollable class="w-100 h-100 border rounded-md">
    <div class="p-4 w-screen h-screen bg-background rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```

## Custom Color

```vue demo
<template>
  <PScrollable class="w-100 h-100 border rounded-md" mask-color="var(--color-primary)" scrollbarColor="hsl(var(--blue-700-value))">
    <div class="p-4 w-screen h-screen bg-background rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```

## Static Content
If your content is static, you can set `static-content` to `true` to optimize performance.

```vue demo
<template>
  <PScrollable class="w-100 h-100 border rounded-md" static-content>
    <div class="p-4 w-screen h-screen bg-background rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```

## Just rolling
Hide scroll edges and scroll bars, leaving only the scrolling function.

```vue demo
<template>
  <PScrollable class="w-100 h-100 border rounded-md" :fader="false" :scrollbar="false">
    <div class="p-4 w-screen h-screen bg-background rounded-inherit">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae alias debitis beatae nesciunt veniam excepturi soluta magnam vitae, eius deleniti non doloremque facere ea, hic incidunt necessitatibus.
    </div>
  </PScrollable>
</template>
```
