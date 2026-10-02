# Date Picker

Select a calendar date from an input.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const date = ref('2024-08-15')
</script>

<template>
  <PDatePicker v-model="date" class="max-w-xs" clearable />
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
      class="max-w-xs"
      label-format="YYYY/MM/DD"
      value-format="timestamp"
    />
    <PDatePicker
      v-model="date2"
      class="max-w-xs"
      label-format="YYYY/MM/DD"
      value-format="YYYY-MM-DD"
    />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'sm' \| 'md' \| 'lg'` | - | Size of the text input |
| error | `boolean \| string` | - | Render the input in its error state |
| disabled | `boolean` | - | Disable the input and block the calendar popover |
| clearable | `boolean` | - | Show a clear button that empties the value |
| model-value | `Date \| string \| number \| null` | - | Selected date, parsed with `value-format` then `label-format` |
| suffix-icon | `boolean` | `true` | Show the calendar icon in the input suffix |
| placeholder | `string` | - | Placeholder text of the input |
| is-date-disabled | `(timestamp: number) => boolean` | - | Validator forwarded to the calendar to grey out days |
| close-on-press-escape | `boolean` | `true` | Close the calendar popover when pressing `Escape` |
| label-format | `string` | `YYYY-MM-DD` | Input display format |
| value-format | `string` | `YYYY-MM-DD` | Output format for `v-model`. Use `'timestamp'` or a Day.js format string |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: ComponentDateTimeValue) => void` | Emitted when a date different from the current one is committed, by picking it in the calendar, typing it into the field or clearing the field. |
| update:modelValue | `(value: ComponentDateTimeValue) => void` | Emitted together with `change` when a date different from the current one is committed. |
