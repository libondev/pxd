# Modal
Display popup content that requires attention or provides additional information.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function handleOpen() {
  isVisible.value = true
}
</script>

<template>
  <PButton @click="handleOpen">Open</PButton>
  <PModal v-model="isVisible" title="Modal Title">
    <div>
      lorem
    </div>
  </PModal>
</template>
```
