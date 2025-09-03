# Time Picker
Select specific time only.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const time = ref('18:30:00')
</script>

<template>
  <PTimePicker v-model="time" class="!w-[220px]"></PTimePicker>
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
  <PTimePicker v-model="time" :presets="presets" class="!w-[220px]"></PTimePicker>
</template>
```
