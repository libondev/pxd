# Effort Slider

Input to pick one level out of a configurable list, e.g. the reasoning effort of a model. Drag the thumb freely, it snaps to the closest level once the pointer is released.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const options = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Max', value: 'max' },
]

const value = ref('medium')
</script>

<template>
  <PStack direction="vertical" gap="3">
    <PEffortSlider v-model="value" :options="options" style="width: 240px;" />
    <PText secondary>{{ value }}</PText>
  </PStack>
</template>
```

## Plain strings

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('medium')
</script>

<template>
  <PEffortSlider v-model="value" :options="['low', 'medium', 'high', 'max']" style="width: 240px;" />
</template>
```

## Uncontrolled

Without `v-model` the slider keeps its own state, and `default-value` picks the starting level.

```vue demo
<template>
  <PEffortSlider
    :options="['low', 'medium', 'high', 'max']"
    default-value="medium"
    style="width: 240px;"
  />
</template>
```

## Colors

```vue demo
<script setup>
import { ref } from 'vue'

const options = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Max', value: 'max' },
]

const colors = {
  0: 'var(--color-gray-700)',
  1: 'var(--color-blue-700)',
  2: 'var(--color-amber-700)',
  3: 'var(--color-red-700)',
}

const value = ref('high')
</script>

<template>
  <PEffortSlider v-model="value" :options="options" :colors="colors" style="width: 240px;" />
</template>
```

## Gradient

A gradient colour is painted as the fill's background image across the whole track, so dragging reveals the gradient instead of stretching it.

```vue demo
<script setup>
import { ref } from 'vue'

const options = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Max', value: 'max' },
]

const colors = {
  0: 'var(--color-blue-600)',
  1: 'var(--color-amber-700)',
  2: 'var(--color-red-800)',
  3: 'linear-gradient(90deg, var(--color-blue-600), var(--color-amber-700), var(--color-red-800))',
}

const value = ref('max')
</script>

<template>
  <PEffortSlider v-model="value" :options="options" :colors="colors" style="width: 240px;" />
</template>
```

## Sizes

```vue demo
<script setup>
import { ref } from 'vue'

const options = ['low', 'medium', 'high', 'max']
const value = ref('low')
</script>

<template>
  <PStack direction="vertical" gap="6">
    <PEffortSlider v-model="value" :options="options" size="sm" style="width: 240px;" />
    <PEffortSlider v-model="value" :options="options" style="width: 240px;" />
    <PEffortSlider v-model="value" :options="options" size="lg" style="width: 240px;" />
  </PStack>
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const options = ['low', 'medium', 'high', 'max']
const value = ref('low')
</script>

<template>
  <PEffortSlider v-model="value" :options="options" disabled style="width: 240px;" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| options | `Array<EffortOption \| string>` | - | Levels from low to high, a string is used as both label and value, `value` falls back to the option index |
| colors | `Record<string, string>` | - | Fill colour keyed by level index, the fill takes the colour of the highest key at or below the current level, levels below the lowest key fall back to `primary`, a gradient value is applied as the fill's background image across the whole track |
| disabled | `boolean` | - | Disable clicking, dragging and keyboard interaction |
| size | `'sm' \| 'md' \| 'lg'` | - | Track and thumb size, falls back to the config provider |
| default-value | `string \| number \| null` | - | Level an uncontrolled slider starts from |
| model-value | `string \| number \| null` | - | Value of the selected level, snapped to the first option when it matches none, bound value wins over `default-value` |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: string \| number) => void` | Emitted when a drag or an arrow key settles on a new level. |
| update:model-value | `(value: string \| number) => void` | Emitted whenever the level changes, including when the initial value is snapped to the first option on mount. |
