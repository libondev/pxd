# Reasoning

Collapsible reasoning UI for assistant "thinking" traces.

## Default


```vue demo
<script setup>
import { ref } from 'vue'

const streaming = ref(true)

setTimeout(() => {
  streaming.value = false
}, 3000)
</script>

<template>
  <PReasoning :streaming="streaming" title="Reasoning">

    <div v-for="i in 5" :key="i">
      <p>This is a reasoning component. {{ i }}</p>
    </div>
  </PReasoning>
</template>
```
