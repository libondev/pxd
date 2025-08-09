# Fader
Indicates that there is still something to show in a certain direction.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const show = ref([])

const options = [
  { label: 'Left', value: 'left' },
  { label: 'Top', value: 'top' },
  { label: 'Right', value: 'right' },
  { label: 'Bottom', value: 'bottom' },
]
</script>

<template>
  <PStack>
    <PCheckboxGroup v-model="show" gap="4" :options="options" />
  </PStack>

  <div class="mt-2 relative size-50 max-w-full rounded-md border border-dashed">
    <PFader direction="vertical" :top="show.includes('top')" :bottom="show.includes('bottom')" />
    <PFader direction="horizontal" :left="show.includes('left')" :right="show.includes('right')" />
  </div>
</template>
```
