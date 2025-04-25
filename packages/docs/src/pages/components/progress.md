# Progress

<script setup>
  const value = ref(50)

  setInterval(() => {
    value.value = Math.random() * 100
  }, 1000)
</script>

## Basic

<PProgress :model-value="30" />

## Random value

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
