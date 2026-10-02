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

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'sm' \| 'md' \| 'lg'` | - | Swatch diameter in `px`: `16`, `20` or `24`, falling back to the config size |
| colors | `string[]` | `() => ['#000000', '#FFFFFF', '#FF0000', '#00FF00', '#0000FF']` | Selectable swatches offered by the selector |
| model-value | `string` | - | Currently selected color, expected to match one of `colors` |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: string) => void` | Emitted when another color swatch is selected. |
| update:modelValue | `(value: string) => void` | Emitted right after `change` with the selected color. |
