# Command Menu

Launch a set of actions as a full-screen overlay.

## Default

```vue demo
<script setup>
import { ref } from "vue";

const showCommandMenu = ref(false);
</script>

<template>
  <PButton variant="primary" @click="showCommandMenu = true"> Open Command Menu </PButton>

  <PCommandMenu v-model="showCommandMenu" placeholder="What do you need?">
    <PCommandMenuGroup label="Suggestions">
      <PListItem label="Figma Import" />
    </PCommandMenuGroup>

    <PCommandMenuGroup label="Commands">
      <PListItem label="Import Extension" />
      <PListItem label="Manage Extensions" />
    </PCommandMenuGroup>

    <PCommandMenuGroup label="Collaboration">
      <PListItem label="Flags Explorer" />
    </PCommandMenuGroup>
  </PCommandMenu>
</template>
```
