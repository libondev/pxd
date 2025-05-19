# Teleport
Provide 2.7 with behavior similar to the `<Teleport>` component built in 3.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const renderTeleport = ref(false)

// Because the elements to be mounted by teleport
// must exist before teleport rendering, the teleport
// component is delayed to render here.
setTimeout(() => {
  renderTeleport.value = true
}, 1000)
</script>

<template>
  <div class="w-40 h-40 bg-background-secondary rounded-md p-2" id="teleport-container" />

  <PTeleport v-if="renderTeleport" to="#teleport-container">
    <PButton>
      Teleport
    </PButton>
  </PTeleport>
</template>
```
