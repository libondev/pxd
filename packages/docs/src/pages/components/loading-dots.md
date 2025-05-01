# LoadingDots
Indicate an action running in the background.

## Default

```vue demo
<template>
  <PStack direction="col" :gap="2">
    <PLoadingDots />
    <PLoadingDots class="text-xl" />
  </PStack>
</template>
```

## With prefix and suffix

```vue demo
<template>
  <PLoadingDots>
    <template #prefix>
      <span class="text-gray-900 text-sm">Loading Left</span>
    </template>
    <template #suffix>
      <span class="text-gray-900 text-sm">Loading Right</span>
    </template>
  </PLoadingDots>
</template>
```
