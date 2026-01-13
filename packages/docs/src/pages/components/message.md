# Message
Display global messages as feedback in response to user operations.

## Default
useMessage needs to ensure that the Message component has been mounted before being invoked. If you need to register multiple times or want to show it in different locations, you can set the group property to isolate it.

```vue demo
<script setup>
import { shallowRef } from 'vue'
import { useMessage } from 'pxd'

const position = shallowRef('top')

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
  const text = loremText.slice(0, Math.ceil(Math.random() * 100))
  useMessage(text, { type })
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
Max prop limits how many message can be displayed at the same time. (default: 5)

```vue demo
<script setup>
import { useMessage } from 'pxd'

function addMessage() {
  useMessage('Now it\'s:' + Date.now(), {
    group: 'max',
    class: 'bg-blue-100 border border-blue-600',
    durations: 5000,
    closeable: true,
  })
}
</script>

<template>
  <PMessage group="max" :max="3" position="bottom" />

  <PButton @click="addMessage()">Add</PButton>
</template>
```

## Clear

```vue demo
<script setup>
import { shallowRef } from 'vue'
import { useMessage, closeMessage, clearMessage } from 'pxd'

let lastKey = 0
const messageRef = shallowRef()

function addMessage() {
  useMessage('Now it\'s:' + Date.now(), {
    key: ++lastKey,
    group: 'clear'
  })
}

function closeLast() {
  closeMessage('clear', lastKey--)
  // Or use the instance method (no need to set group)
  // messageRef.value.close(lastKey--)
}

function clearAll() {
  clearMessage('clear')
  // Or use the instance method (no need to set group)
  // messageRef.value.clear()
}
</script>

<template>
  <PMessage ref="messageRef" group="clear" position="bottom" />

  <PStack>
    <PButton @click="addMessage">Add</PButton>
    <PButton @click="closeLast">Close last</PButton>
    <PButton @click="clearAll">Clear all</PButton>
  </PStack>
</template>
```
