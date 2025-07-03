# Teleport
Provide 2.7 with behavior similar to the `<Teleport>` component built in 3.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const renderDisabled = ref(false)
const renderTeleport = ref(false)

// Because the elements to be mounted by teleport
// must exist before teleport rendering, the teleport
// component is delayed to render here.
setTimeout(() => {
  renderTeleport.value = true
}, 1000)

function toggleTeleport() {
  renderDisabled.value = !renderDisabled.value
}
</script>

<template>
  <PButton @click="toggleTeleport">Toggle</PButton>

  <div id="teleport-container" class="w-40 h-40 bg-background-secondary rounded-md p-2 my-2 border border-dashed"></div>

  <PTeleport
    v-if="renderTeleport"
    :disabled="renderDisabled"
    to="#teleport-container"
  >
    <PButton>
      Teleport
    </PButton>
  </PTeleport>
</template>
```
