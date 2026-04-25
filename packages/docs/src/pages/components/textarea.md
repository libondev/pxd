# Textarea

Retrieve multi-line user input.

## Default

```vue demo
<template>
  <PTextarea
    rows="4"
    placeholder="Please enter your text here..."
  />
</template>
```

## Disabled

```vue demo
<template>
  <PTextarea
    disabled
    rows="4"
    placeholder="Please enter your text here..."
  />
</template>
```

## Error

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
)
</script>

<template>
  <PStack gap="12" direction="vertical">
    <PTextarea v-model="value" size="xs" error="There has been an error." />
    <PTextarea v-model="value" size="sm" error="There has been an error." />
    <PTextarea v-model="value" size="md" error="There has been an error." />
    <PTextarea v-model="value" size="lg" error="There has been an error." />
  </PStack>
</template>
```
