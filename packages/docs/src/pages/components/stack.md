# Stack
Display elements vertically or horizontally on the page.

## Gap
Gap is a unit on a `4px` grid scale.

```vue demo
<template>
  <PStack>
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    <div class="bg-gray-1000 h-12 w-12 rounded-md" />
  </PStack>
</template>
```

## Scale
You can modify the default zoom ratio by passing in the `scale` attribute. (The gap is `4 * 4 = 16`)

```vue demo
<script setup>
import { ref } from 'vue'

const gap = ref(4)
const scale = ref(4)
</script>

<template>
  <PStack direction="vertical">
    <PNumberInput v-model="gap" label="gap" :min="0" :max="50" class="!w-40" />

    <PNumberInput v-model="scale" label="scale" :min="0" :max="50" class="!w-40" />

    <PStack :gap="gap" :scale="scale">
      <div class="bg-gray-1000 h-12 w-12 rounded-md" />
      <div class="bg-gray-1000 h-12 w-12 rounded-md" />
      <div class="bg-gray-1000 h-12 w-12 rounded-md" />
    </PStack>
  </PStack>
</template>
```

## Responsive
Resize the window to observe changes to the layout.

```vue demo
<template>
  <PStack
    :gap="{ sm: 6, md: 8, lg: 10, xl: 15 }"
    :direction="{ xs: 'vertical', lg: 'horizontal' }"
  >
    <div class="bg-gray-1000 h-12 w-12 rounded-md"></div>
    <div class="bg-gray-1000 h-12 w-12 rounded-md"></div>
    <div class="bg-gray-1000 h-12 w-12 rounded-md"></div>
  </PStack>
</template>
```
