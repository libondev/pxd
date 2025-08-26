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
