# Date Picker

Select a calendar date from an input.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const date = ref('2024-08-15')
</script>

<template>
  <PDatePicker v-model="date" class="!w-[220px]" clearable />
</template>
```

## Formatter

`label-format` controls the input text. `value-format` controls the `v-model` value. Incomplete input such as `2024` is completed to `2024-01-01` when it can be parsed as a year; values that cannot be completed are restored on outside click.

```vue demo
<script setup>
import { ref } from 'vue'

const date1 = ref(Date.now())
const date2 = ref('2024-08-15')
</script>

<template>
  <PStack direction="vertical" gap="2">
    <PText class="mb-2">Value1 formatted: {{ date1 }}</PText>
    <PText class="mb-2">Value2 formatted: {{ date2 }}</PText>

    <PDatePicker
      v-model="date1"
      class="!w-[220px]"
      label-format="YYYY/MM/DD"
      value-format="timestamp"
    />
    <PDatePicker
      v-model="date2"
      class="!w-[220px]"
      label-format="YYYY/MM/DD"
      value-format="YYYY-MM-DD"
    />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'sm' \| 'md' \| 'lg'` | - | - |
| error | `boolean \| string` | - | - |
| disabled | `boolean` | - | - |
| clearable | `boolean` | - | - |
| model-value | `Date \| string \| number \| null` | - | - |
| suffix-icon | `boolean` | `true` | - |
| placeholder | `string` | - | - |
| close-on-press-escape | `boolean` | `true` | - |
| label-format | `string` | `YYYY-MM-DD` | Input display format |
| value-format | `string` | `YYYY-MM-DD` | Output format for `v-model`. Use `'timestamp'` or a Day.js format string |
