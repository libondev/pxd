# LoadingDots
Indicate an action running in the background.

## Default

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
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
      <PText secondary>Loading Left</PText>
    </template>
    <template #suffix>
      <PText secondary>Loading Right</PText>
    </template>
  </PLoadingDots>
</template>
```
