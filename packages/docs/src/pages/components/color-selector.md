# Color Selector

Interactive color picker component.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const colors = ['#fb2c36', '#2b7fff', '#00c951', '#f0b100', '#ad46ff']

const color = ref(colors[0])
</script>

<template>
  <PColorSelector v-model="color" :colors="colors" />
</template>
```

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const colors = ['#fb2c36', '#2b7fff', '#00c951', '#f0b100', '#ad46ff']

const color = ref(colors[0])
</script>

<template>
  <PStack direction="vertical">
    <PColorSelector size="sm" v-model="color" :colors="colors" />
    <PColorSelector size="md" v-model="color" :colors="colors" />
    <PColorSelector size="lg" v-model="color" :colors="colors" />
  </PStack>
</template>
```
