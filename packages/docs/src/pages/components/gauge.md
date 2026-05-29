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
    <PGauge v-model="progress" show-value />

    <PStack>
      <PButton variant="primary" @click="increase">Increase</PButton>
      <PButton @click="decrease">Decrease</PButton>
    </PStack>
  </PStack>
</template>
```

## Custom secondary color

```vue demo
<script setup>
import { ref } from 'vue'

const progress = ref(50)

const colors = {
  primary: 'var(--color-blue-700)',
  secondary: 'var(--color-blue-300)',
}
</script>

<template>
  <PGauge v-model="progress" :colors="colors" />
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
| model-value | `number \| null` | `60` | - |
| show-value | `boolean` | `false` | - |
| indeterminate | `boolean` | - | - |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | - |
| colors | `Record<string, string>` | - | - |
