# Stack
Display elements vertically or horizontally on the page.

## Gap
Gap is a unit on a `4px` grid scale.

```vue demo
<template>
  <PStack :gap="3" :direction="{ sm: 'row', lg: 'row' }">
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
    :direction="{ sm: 'col', lg: 'row' }"
  >
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
  </PStack>
</template>
```
