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

## Colors

Set `colors` per level, the key is the level index. A level without an entry carries the colour of the previous one, the lowest level falls back to `primary`. A value can be any CSS background, so a gradient gives a smooth transition.

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
  2: 'linear-gradient(90deg, var(--color-blue-700), var(--color-amber-700))',
  3: 'linear-gradient(90deg, var(--color-amber-700), var(--color-red-700))',
}

const value = ref('high')
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
| colors | `Record<string, string>` | - | Fill colour per level, the key is the level index, a level without an entry carries the previous one, the lowest level falls back to `primary` |
| disabled | `boolean` | - | Disable clicking, dragging and keyboard interaction |
| size | `'sm' \| 'md' \| 'lg'` | - | Track and thumb size, falls back to the config provider |
| model-value | `string \| number \| null` | - | Value of the selected level, snapped to the first option when it matches none |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: string \| number) => void` | Emitted when a drag or an arrow key settles on a new level. |
| update:modelValue | `(value: string \| number) => void` | Emitted whenever the level changes, including when the initial value is snapped to the first option on mount. |
