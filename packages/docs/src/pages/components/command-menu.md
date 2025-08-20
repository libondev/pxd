# CommandMenu
Launch a set of actions as a full-screen overlay.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <PButton variant="primary" @click="open = true">
    Open Command Menu
  </PButton>

  <PCommandMenu v-model="open" />
</template>
```
