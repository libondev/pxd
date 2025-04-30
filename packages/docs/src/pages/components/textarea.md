# Textarea
Retrieve multi-line user input.

## Default

```vue demo
<template>
  <PTextarea
    class="min-h-25"
    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  />
</template>
```

## Disabled

```vue demo
<template>
  <PTextarea
    disabled
    class="min-h-25"
    placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
  />
</template>
```

## Error

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.')
</script>

<template>
  <PStack gap="12" direction="col">
    <PTextarea
      v-model="value"
      size="xs"
      class="min-h-25"
      error="There has been an error."
    />
    <PTextarea
      v-model="value"
      size="sm"
      class="min-h-25"
      error="There has been an error."
    />
    <PTextarea
      v-model="value"
      size="md"
      class="min-h-25"
      error="There has been an error."
    />
    <PTextarea
      v-model="value"
      size="lg"
      class="min-h-25"
      error="There has been an error."
    />
  </PStack>
</template>
```
