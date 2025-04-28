<script setup>
  import { ref, onBeforeUnmount } from 'vue'

  const value = ref(50)

  const colors = {
    10: '#f00',
    30: '#f0f',
    50: '#ff0',
    70: '#0ff',
    90: '#0f0',
  }

  const timer = setInterval(() => {
    value.value = Math.random() * 100
  }, 1000)

  onBeforeUnmount(() => {
    clearInterval(timer)
  })
</script>

# Progress

Display progress relative to a limit or related to a task.

## Default

<PProgress :model-value="30" />

## Animation

<PProgress v-model="value" />

```html
<script setup>
  const value = ref(50)

  setInterval(() => {
    value.value = Math.random() * 100
  }, 1000)
</script>

<template>
  <PProgress v-model="value" />
</template>
```

## Colors
Customize the colors of the display at different stages.

<PProgress v-model="value" :colors="colors" />

```html
<script setup>
  const value = ref(50)

  setInterval(() => {
    value.value = Math.random() * 100
  }, 1000)

  const colors = {
    10: '#f00',
    30: '#f0f',
    50: '#ff0',
    70: '#0ff',
    90: '#0f0',
  }
</script>

<template>
  <PProgress v-model="value" :colors="colors" />
</template>
```
