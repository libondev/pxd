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

## Formatter

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PText class="mb-2">Value formatted: {{ time }}</PText>
  <PTimePicker v-model="time" class="!w-[220px]" formatter="HH-mm" valueFormatter="HH:mm:ss" />
</template>
```

## Disabled

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" disabled class="!w-[220px]" formatter="hh:mm:ss" />
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
