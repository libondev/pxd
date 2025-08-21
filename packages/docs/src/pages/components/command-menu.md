# CommandMenu
Launch a set of actions as a full-screen overlay.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const showCommandMenu = ref(false)
</script>

<template>
  <PButton variant="primary" @click="showCommandMenu = true">
    Open Command Menu
  </PButton>

  <PCommandMenu
    v-model="showCommandMenu"
    placeholder="What do you need?"
  >
    <PListItem v-for="i of 10" :key="i" :label="i" />
  </PCommandMenu>
</template>
```
