# Teleport
Provide 2.7 with behavior similar to the `<Teleport>` component built in 3.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const renderDisabled = ref(false)

function toggleTeleport() {
  renderDisabled.value = !renderDisabled.value
}
</script>

<template>
  <PButton variant="primary" @click="toggleTeleport">Toggle</PButton>

  <div id="target" class="w-40 h-40 bg-background-200 rounded-md p-2 my-2 border border-dashed"></div>

  <PTeleport to="#target" :disabled="renderDisabled">
    <PButton>
      render {{ renderDisabled ? 'outside' : 'inside' }}
    </PButton>
  </PTeleport>
</template>
```
