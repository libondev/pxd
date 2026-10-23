# Gauge

A circular visual for conveying a percentage.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const progress = ref(50)
</script>

<template>
  <PStack align="center" gap="8">
    <PGauge v-model="progress" size="xs" />
    <PGauge v-model="progress" size="sm" />
    <PGauge v-model="progress" />
    <PGauge v-model="progress" size="lg" />
  </PStack>
</template>
```

## Label

```vue demo
<script setup>
import { ref } from 'vue'

const progress = ref(80)
const progress2 = ref(100)
</script>

<template>
  <PStack align="center" gap="8">
    <PGauge v-model="progress" show-value size="xs" />
    <PGauge v-model="progress2" show-value size="xs" />
    <PGauge v-model="progress" show-value size="sm" />
    <PGauge v-model="progress2" show-value size="sm" />
    <PGauge v-model="progress" show-value />
    <PGauge v-model="progress2" show-value />
    <PGauge v-model="progress" show-value size="lg" />
    <PGauge v-model="progress2" show-value size="lg" />
  </PStack>
</template>
```

## Default color scale

```vue demo
<script setup>
import { ref } from 'vue'

const progress = ref(14)
const progress2 = ref(34)
const progress3 = ref(68)
</script>

<template>
  <PStack align="center" gap="8">
    <PGauge v-model="progress" />
    <PGauge v-model="progress2" />
    <PGauge v-model="progress3" />
  </PStack>
</template>
```

## Custom color range

```vue demo
<script setup>
import { ref } from 'vue'

const progress = ref(15)
const colors = {
  0: 'var(--color-blue-800)',
  30: 'var(--color-amber-800)',
  60: 'var(--color-pink-700)',
  80: 'var(--color-teal-700)'
}

function increase() {
  if (progress.value < 100) {
    progress.value += 5
  }
}

function decrease() {
  if (progress.value > 0) {
    progress.value -= 5
  }
}
</script>

<template>
  <PStack direction="vertical" gap="8">
    <PGauge v-model="progress" show-value :colors="colors" />

    <PStack>
      <PButton variant="primary" @click="increase">Increase</PButton>
      <PButton @click="decrease">Decrease</PButton>
    </PStack>
  </PStack>
</template>
```

## Custom colors

```vue demo
<script setup>
import { ref } from 'vue'

const progress = ref(50)
</script>

<template>
  <PStack align="center" gap="8">
    <PGauge
      v-model="progress"
      primary-color="var(--color-blue-700)"
      secondary-color="var(--color-blue-300)"
    />
    <PGauge
      v-model="progress"
      primary-color="var(--color-teal-700)"
      secondary-color="var(--color-teal-300)"
    />
  </PStack>
</template>
```

## Indeterminate

```vue demo
<script setup>
import { ref } from 'vue'

const progress = ref(50)
</script>

<template>
  <PStack align="center">
    <PGauge v-model="progress" size="xs" indeterminate />
    <PGauge v-model="progress" size="sm" indeterminate />
    <PGauge v-model="progress" indeterminate />
    <PGauge v-model="progress" size="lg" indeterminate />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `number \| null` | `60` | Progress percentage, clamped between `0` and `100` |
| show-value | `boolean` | `false` | Show the percentage in the center, always hidden at `xs` size |
| indeterminate | `boolean` | - | Ignore the value and show an activity icon over a gray track |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Component size |
| colors | `Record<string, string>` | - | Color stops keyed by threshold |
| primary-color | `string` | - | Fill color, overrides the `colors` scale |
| secondary-color | `string` | - | Track color |
