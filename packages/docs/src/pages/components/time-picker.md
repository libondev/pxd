# Time Picker

Select specific time only.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" class="max-w-xs" />
</template>
```

## Clearable

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" class="max-w-xs" clearable />
</template>
```

## Presets

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')

const presets = [
  {
    label: '12:00:00',
    getDate: () => {
      const date = new Date()
      date.setHours(12)
      date.setMinutes(0)
      date.setSeconds(0)
      return date
    },
  },
  {
    label: '45m later',
    getDate: () => {
      const date = new Date()
      date.setMinutes(date.getMinutes() + 45)
      return date
    },
  },
]
</script>

<template>
  <PTimePicker v-model="time" :presets="presets" class="max-w-xs" />
</template>
```

## Hidden seconds

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" :show-seconds="false" class="max-w-xs" />
</template>
```

## Formatter

```vue demo
<script setup>
import { ref } from 'vue'

const time1 = ref(Date.now())
const time2 = ref('18:30:25')
</script>

<template>
  <PStack direction="vertical" gap="2">
    <PText class="mb-2">Value1 formatted: {{ time1 }}</PText>
    <PText class="mb-2">Value2 formatted: {{ time2 }}</PText>

    <PTimePicker v-model="time1" class="max-w-xs" label-format="HH-mm" value-format="timestamp" />
    <PTimePicker v-model="time2" class="max-w-xs" label-format="HH-mm" value-format="HH:mm:00" />
  </PStack>
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" disabled class="max-w-xs" />
</template>
```

## Error

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PStack class="max-w-sm" gap="8" direction="vertical">
    <PTimePicker v-model="time" error size="sm" placeholder="sm" />
    <PTimePicker v-model="time" error placeholder="md" />
    <PTimePicker v-model="time" error size="lg" placeholder="lg" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'sm' \| 'md' \| 'lg'` | - | Size of the text input |
| error | `boolean \| string` | - | Render the input in its error state |
| presets | `DateTimePreset[]` | `() => []` | Quick picks beside the lists, each with a `label` and a `getDate` callback |
| disabled | `boolean` | - | Disable the input and block the time panel from opening |
| clearable | `boolean` | - | Show a clear button that empties the value |
| model-value | `Date \| string \| number \| null` | `` | Selected time, parsed with `value-format` and shown with `label-format` |
| suffix-icon | `boolean` | `true` | Show the clock icon in the input suffix |
| placeholder | `string` | - | Placeholder text of the input |
| show-seconds | `boolean` | `true` | Show the seconds column in the time panel |
| close-on-press-escape | `boolean` | `true` | Close the time panel when pressing `Escape` |
| label-format | `string` | `HH:mm:ss` | Day.js format used to display the time in the input |
| value-format | `string` | `HH:mm:ss` | Output format for `v-model`. Use `'timestamp'` or a Day.js format string |
