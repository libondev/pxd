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
  <PReasoning :streaming="streaming">
    <div v-for="i in 5" :key="i">
      <p>This is a reasoning component. {{ i }}</p>
    </div>
  </PReasoning>
</template>
```

## Simple

```vue demo
<template>
  <PReasoning variant="simple" :expand="false">
    <div v-for="i in 5" :key="i">
      <p>This is a reasoning component. {{ i }}</p>
    </div>
  </PReasoning>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `'default' \| 'simple'` | `default` | `simple` drops the card background, border and trigger padding |
| streaming | `boolean` | `true` | Streaming state; drives the shimmer and the title (`thinking` / `thought`) |
| expand | `boolean` | `true` | Expanded state, applied whenever the value changes |
| title | `ComponentLabel` | - | Title text; falls back to `locale.reasoning.thinking` / `thought` |
