# Message
Display global messages as feedback in response to user operations.

## Default
Message can be used only once in the root component. If you need to register multiple times or want to show it in different locations, you can set the group property to isolate it.

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

const loremText = 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloremque minima, excepturi distinctio quis asperiores magnam voluptate nostrum quibusdam!'

function addMessage(type) {
  useMessage(loremText.slice(0, Math.floor(Math.random() * 100)), { type })
}
</script>

<template>
  <PMessage :position="position" />

  <PStack direction="vertical">
    <PRadioGroup v-model="position" :options="options" />

    <PStack gap="2">
      <PButton @click="addMessage()">Add normal</PButton>
      <PButton @click="addMessage('info')">Add info</PButton>
      <PButton @click="addMessage('error')">Add error</PButton>
      <PButton @click="addMessage('loading')">Add loading</PButton>
      <PButton @click="addMessage('warning')">Add warning</PButton>
      <PButton @click="addMessage('success')">Add success</PButton>
    </PStack>
  </PStack>
</template>
```

## Max
Max prop limits how many message can be displayed at the same time. (default: 6)

```vue demo
<script setup>
import { ref } from 'vue'
import { useMessage } from 'pxd'

function addMessage() {
  useMessage('Now it\'s:' + Date.now(), {
    group: 'max',
    class: 'bg-blue-100',
    durations: 5000,
    closeable: true,
  })
}
</script>

<template>
  <PMessage group="max" :max="3" />

  <PButton @click="addMessage()">Add</PButton>
</template>
```
