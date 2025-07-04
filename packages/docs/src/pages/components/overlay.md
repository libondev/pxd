# Overlay


## Default

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function onClickToClose() {
  isVisible.value = false
  console.log('🥑overlay.md:13/(false):\n', false)
}
</script>

<template>
  <PButton @click="isVisible = true">Open</PButton>
  <POverlay v-model="isVisible" @click="onClickToClose" />
</template>
```
