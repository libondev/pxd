# Message
Display global messages as feedback in response to user operations.

## Default

```vue demo
<script setup>
import { ref } from 'vue'
import { useMessage } from 'pxd'

const position = ref('top')

const options = [
  { label: 'Top Start', value: 'top-start' },
  { label: 'Top', value: 'top' },
  { label: 'Top End', value: 'top-end' },
  { label: 'Bottom Start', value: 'bottom-start' },
  { label: 'Bottom', value: 'bottom' },
  { label: 'Bottom End', value: 'bottom-end' },
]

function onAddMessage(type) {
  useMessage('Now it\'s:' + Date.now(), { type })
}
</script>

<template>
  <PMessage :position="position" />

  <PStack direction="vertical">
    <PRadioGroup v-model="position" :options="options" />

    <PStack gap="2">
      <PButton @click="onAddMessage()">Add normal</PButton>
      <PButton @click="onAddMessage('info')">Add info</PButton>
      <PButton @click="onAddMessage('error')">Add error</PButton>
      <PButton @click="onAddMessage('warning')">Add warning</PButton>
      <PButton @click="onAddMessage('success')">Add success</PButton>
    </PStack>
  </PStack>
</template>
```
