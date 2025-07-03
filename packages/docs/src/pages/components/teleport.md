# Teleport
Provide 2.7 with behavior similar to the `<Teleport>` component built in 3.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const renderTeleport = ref(false)

function toggleTeleport() {
  renderTeleport.value = !renderTeleport.value
}
</script>

<template>
  <div id="teleport-container" class="w-40 h-40 bg-background-secondary rounded-md p-2 mb-2 border border-dashed"></div>

  <PButton @click="toggleTeleport">Toggle</PButton>

  <PTeleport v-if="renderTeleport" to="#teleport-container">
    <PButton>
      Teleport
    </PButton>
  </PTeleport>
</template>
```
