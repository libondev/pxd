# Separator

Visually or semantically separates content.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const direction = ref('horizontal')
</script>

<template>
  <PSwitch v-model="direction">
    <PSwitchItem value="horizontal">Horizontal</PSwitchItem>
    <PSwitchItem value="vertical">Vertical</PSwitchItem>
  </PSwitch>

  <div class="mt-2 flex gap-2 text-sm" :class="{ 'flex-row items-center': direction === 'vertical', 'flex-col': direction === 'horizontal' }">
    <div>One</div>

    <PSeparator :direction="direction" />

    <div>Two</div>
  </div>
</template>
```
