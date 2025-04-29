

# Progress

Display progress relative to a limit or related to a task.

## Default

```vue demo
<template>
  <PProgress :model-value="30" />
</template>
```

## Animation

```vue demo
<script setup>
  const value = ref(50)

  const timer = setInterval(() => {
    value.value = Math.random() * 100
  }, 1000)

  onUnmounted(() => {
    clearInterval(timer)
  })
</script>

<template>
  <PProgress v-model="value" />
</template>
```

## Colors
Customize the colors of the display at different stages.

```vue demo
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
