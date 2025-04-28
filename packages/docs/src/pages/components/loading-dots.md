# LoadingDots
Indicate an action running in the background.

## Default

<PStack direction="col" :gap="2" class="p-2">
  <PLoadingDots />
  <PLoadingDots class="text-xl" />
</PStack>

```html
<PLoadingDots />
<PLoadingDots class="text-xl" />
```

## With prefix and suffix

<PLoadingDots class="p-2">
  <template #prefix>
    <span class="text-gray-900 text-sm">Loading Left</span>
  </template>
  <template #suffix>
    <span class="text-gray-900 text-sm">Loading Right</span>
  </template>
</PLoadingDots>

```html
<PLoadingDots class="p-2">
  <template #prefix>
    <span class="text-gray-900 text-sm">Loading Left</span>
  </template>
  <template #suffix>
    <span class="text-gray-900 text-sm">Loading Right</span>
  </template>
</PLoadingDots>
```
