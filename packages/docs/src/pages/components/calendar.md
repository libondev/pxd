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
    <template #default="{ date }">
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

## Compact

Use a compact layout for narrow containers or picker panels.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(Date.now())
</script>

<template>
  <div class="max-w-72">
    <PCalendar v-model="value" compact />
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| default-value | `number \| null` | `null` | Default selected date timestamp |
| model-value | `number \| null` | - | Selected date timestamp |
| is-date-disabled | `(timestamp: number) => boolean` | - | Date disabled validator |
| compact | `boolean` | `false` | Use a compact layout for narrow containers |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:modelValue | `(timestamp: number, info: CalendarDateInfo) => void` | Emitted when a date is selected |
| panel-change | `(info: CalendarPanelInfo) => void` | Emitted when the visible month changes |

## Slots

| Name | Parameters | Description |
| --- | --- | --- |
| default | `{ year, month, date, timestamp }` | Content rendered inside each date |
| header | `{ year, month }` | Calendar header |
