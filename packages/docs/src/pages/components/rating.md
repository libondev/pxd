# Rating

Rating component for user feedback

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PRating v-model="value" />
</template>
```

## Sizes

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PStack align="center">
    <PRating v-model="value" size="sm" />
    <PRating v-model="value" />
    <PRating v-model="value" size="lg" />
  </PStack>
</template>
```

## Half Star

Enable `allow-half` to support half-star ratings.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PRating v-model="value" allow-half />
</template>
```

## Clearable

Enable `clearable` to allow clearing the value by clicking the same star.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(3)
</script>

<template>
  <PRating v-model="value" clearable />
</template>
```

## Readonly

```vue demo
<template>
  <PRating :model-value="3" readonly />
</template>
```

## Disabled

```vue demo
<template>
  <PRating :model-value="3" disabled />
</template>
```

## Custom Color

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PStack direction="vertical">
    <PRating v-model="value" color="var(--color-amber-600)" />
    <PRating v-model="value" color="var(--color-red-700)" void-color="var(--color-gray-alpha-200)" />
  </PStack>
</template>
```

## Custom Count

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(0)
</script>

<template>
  <PRating v-model="value" :count="10" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `number` | `0` | Current rating value |
| count | `number` | `5` | Number of stars |
| size | `'sm' \| 'md' \| 'lg'` | `'md'` | Star size |
| color | `string` | - | Active star color |
| void-color | `string` | - | Inactive star color |
| allow-half | `boolean` | `false` | Allow half star selection |
| readonly | `boolean` | `false` | Readonly mode |
| disabled | `boolean` | `false` | Disabled mode |
| clearable | `boolean` | `false` | Allow clearing value by clicking the same star |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:model-value | `(value: number) => void` | Emitted when rating changes |
| change | `(value: number) => void` | Emitted when rating changes (same as update) |
