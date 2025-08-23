# Command Menu
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
    <PCommandMenuGroup label="Suggestions">
      <PCommandMenuItem label="Figma Import" />
    </PCommandMenuGroup>

    <PCommandMenuGroup label="Commands">
      <PCommandMenuItem label="Import Extension" />
      <PCommandMenuItem label="Manage Extensions" />
    </PCommandMenuGroup>

    <PCommandMenuGroup label="Collaboration">
      <PCommandMenuItem label="Flags Explorer" />
    </PCommandMenuGroup>
  </PCommandMenu>
</template>
```
