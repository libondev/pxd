# Time Picker

Select specific time only.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" class="!w-[220px]" />
</template>
```

## Clearable

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" class="!w-[220px]" clearable />
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
  <PTimePicker v-model="time" :presets="presets" class="!w-[220px]" />
</template>
```

## Hidden seconds

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" :show-seconds="false" class="!w-[220px]" />
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

    <PTimePicker v-model="time1" class="!w-[220px]" format="HH-mm" value-format="timestamp" />
    <PTimePicker v-model="time2" class="!w-[220px]" format="HH-mm" value-format="HH:mm:00" />
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
  <PTimePicker v-model="time" disabled class="!w-[220px]" />
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
| size | `'sm' \| 'md' \| 'lg'` | - | - |
| error | `boolean \| string` | - | - |
| presets | `DateTimePreset[]` | `() => []` | - |
| disabled | `boolean` | - | - |
| clearable | `boolean` | - | - |
| model-value | `Date \| string \| number \| null` | `` | - |
| suffix-icon | `boolean` | `true` | - |
| placeholder | `string` | - | - |
| show-seconds | `boolean` | `true` | - |
| close-on-press-escape | `boolean` | `true` | - |
| format | `string` | `HH:mm:ss` | - |
| value-format | `string` | `HH:mm:ss` | - |
