# Calendar

Display and select a date.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>

<template>
  <PCalendar v-model="value" />
</template>
```

## Custom Content

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>

<template>
  <PCalendar v-model="value">
    <template #item="{ date }">
      <span>{{ date }}</span>

      <span v-if="date === 1" class="ml-1 text-xs font-medium text-red-900">New</span>
    </template>
  </PCalendar>
</template>
```

## Disabled Dates

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(Date.now())

function isDateDisabled(timestamp) {
  return new Date(timestamp).getDay() === 0
}
</script>

<template>
  <PCalendar v-model="value" :is-date-disabled="isDateDisabled" />
</template>
```

## Formatter

Use `value-format` to control the data written back to `v-model`. Pass `'timestamp'` to emit a number, or any Day.js format string.

```vue demo
<script setup>
import { ref } from 'vue'

const value1 = ref(Date.now())
const value2 = ref('2024-08-15')
</script>

<template>
  <PStack direction="vertical" gap="4">
    <div>
      <PText class="mb-2">Value formatted: {{ value1 }}</PText>
      <PCalendar v-model="value1" value-format="timestamp" />
    </div>
    <div>
      <PText class="mb-2">Value formatted: {{ value2 }}</PText>
      <PCalendar v-model="value2" value-format="YYYY-MM-DD" />
    </div>
  </PStack>
</template>
```

## Compact

Use a compact layout for narrow containers or picker panels.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>

<template>
  <div class="max-w-max max-sm:mx-auto">
    <PCalendar v-model="value" compact />
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| default-value | `number \| string \| Date \| null` | `null` | Default selected date |
| model-value | `number \| string \| Date \| null` | - | Selected date |
| value-format | `string` | `'timestamp'` | Output format for `v-model`. Use `'timestamp'` or a Day.js format string |
| is-date-disabled | `(timestamp: number) => boolean` | - | Date disabled validator |
| compact | `boolean` | `false` | Use a compact layout for narrow containers |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:modelValue | `(value: number \| string \| Date \| null) => void` | Emitted when a date is selected |
| change | `(value: number \| string \| Date \| null) => void` | Emitted when a date is selected |
| panel-change | `(info: CalendarPanelInfo) => void` | Emitted when the visible month changes |

## Slots

| Name | Parameters | Description |
| --- | --- | --- |
| item | `{ year, month, date, timestamp }` | Content rendered inside each date |
| header | `{ year, month }` | Calendar header |
