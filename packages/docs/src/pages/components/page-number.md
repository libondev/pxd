# Page Number

Navigate data that spans multiple pages.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const page = ref(1)
</script>

<template>
  <PPageNumber v-model="page" :total="200" />
</template>
```

## Sizes

```vue demo
<template>
  <PStack direction="vertical">
    <PPageNumber size="sm" :total="200" />
    <PPageNumber size="md" :total="200" />
    <PPageNumber size="lg" :total="200" />
  </PStack>
</template>
```

## Quick Jumper

Use `show-quick-jumper` to let users enter a page number. The value is submitted on Enter or blur.

```vue demo
<script setup>
import { ref } from 'vue'

const page = ref(1)
</script>

<template>
  <PPageNumber v-model="page" :total="200" :page-size="10" show-quick-jumper />
</template>
```

## Disabled

```vue demo
<template>
  <PPageNumber :model-value="3" :total="200" :page-size="10" show-quick-jumper disabled />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `number` | `1` | Current page, supports `v-model` |
| page-size | `number` | `20` | Number of items per page |
| total | `number` | `0` | Total number of items |
| disabled | `boolean` | `false` | Disables all page controls |
| show-quick-jumper | `boolean` | `false` | Shows an input for jumping to a page |
| size | `'sm' \| 'md' \| 'lg'` | `configProvider.size` | Size of page controls |

## Events

| Name | Parameters | Description |
| --- | --- | --- |
| update:model-value | `(page: number)` | Emitted when the page changes |
