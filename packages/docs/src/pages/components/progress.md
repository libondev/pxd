# Progress

Display progress relative to a limit or related to a task.

## Default

```vue demo
<script setup>
const value = ref(30)
</script>

<template>
  <PStack>
    <PProgress v-model="value" size="sm" />
    <PProgress v-model="value" />
    <PProgress v-model="value" size="lg" />
  </PStack>
</template>
```

## Custom min/max

```vue demo
<script setup>
const value = ref(30)
</script>

<template>
  <PProgress v-model="value" :min="20" :max="40" />
</template>
```

## Dynamic colors

Customize the colors of the display at different stages.

```vue demo
<script setup>
const progress = ref(0)

const colors = {
  0: 'var(--color-foreground)',
  25: 'var(--color-red-700)',
  50: 'var(--color-amber-700)',
  75: 'var(--color-pink-700)',
  100: 'var(--color-blue-700)',
}

function increase() {
  if (progress.value < 100) {
    progress.value += 10
  }
}

function decrease() {
  if (progress.value > 0) {
    progress.value -= 10
  }
}
</script>

<template>
  <PProgress v-model="progress" :colors="colors" label />
  <PProgress v-model="progress" :colors="colors"> {{ progress }} / 100 </PProgress>

  <PStack class="mt-4">
    <PButton variant="primary" @click="increase">Increase</PButton>
    <PButton @click="decrease">Decrease</PButton>
  </PStack>
</template>
```

## Themed

```vue demo
<template>
  <PStack gap="6">
    <PProgress :model-value="80" variant="success" />
    <PProgress :model-value="10" variant="error" />
    <PProgress :model-value="40" variant="warning" />
    <PProgress :model-value="70" variant="secondary" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| min | `number` | `0` | Lower bound of the progress range |
| max | `number` | `100` | Upper bound of the progress range |
| size | `'sm' \| 'md' \| 'lg'` | - | Thickness of the track; falls back to the config provider size |
| label | `boolean \| string \| number` | `false` | Show the value as text, or replace it with a custom string |
| variant | `'primary' \| 'error' \| 'warning' \| 'success' \| 'secondary'` | `primary` | Color of the filled bar |
| colors | `Record<string, string>` | - | Threshold-to-color map; the highest key below the value wins |
| model-value | `number \| null` | - | Current progress value, clamped between `min` and `max` |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
