# Stack
Display elements vertically or horizontally on the page.

## Gap
Gap is a unit on a `4px` grid scale.

```vue demo
<template>
  <PStack gap="3" direction="row">
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
  </PStack>
</template>
```

## Scale
You can modify the default zoom ratio by passing in the `scale` attribute. (The gap is `3 * 2 = 6`)

```vue demo
<template>
  <PStack gap="3" :scale="2">
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
  </PStack>
</template>
```

## Responsive
Resize the window to observe changes to the layout.

```vue demo
<template>
  <PStack
    :gap="{ sm: 2, md: 5, lg: 10, xl: 15 }"
    :direction="{ xs: 'row', lg: 'row' }"
  >
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
  </PStack>
</template>
```
