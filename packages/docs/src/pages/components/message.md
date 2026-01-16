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

## Promise
Sometimes it is necessary to rely on certain states to complete.

```vue demo
<script setup>
import { useMessage } from 'pxd'

const promise = () => new Promise((resolve, reject) => {
  setTimeout(() => {
    const data = { id: Math.random().toString(16).slice(2) }
    if (Math.random() > .5) {
      resolve(data)
    } else {
      reject(data)
    }
  }, 1000)
});

function addMessage() {
  useMessage('Loading...', {
    type: 'loading',
    promise: promise(),
    group: 'promise',
    success: (data) => {
      return `Success: ${data.id} is latest.`
    },
    error: 'Error',
    // If set, the value of success/error will be overwritten.
    // finally: 'Operation finished.',
  })
}
</script>

<template>
  <PMessage group="promise" />

  <PButton @click="addMessage()">Add</PButton>
</template>
```

## Max
Max prop limits how many message can be displayed at the same time. (default: 3)

```vue demo
<script setup>
import { useMessage } from 'pxd'

function addMessage() {
  useMessage('Now it\'s:' + Date.now(), {
    class: 'bg-blue-100 border border-dashed border-blue-600 font-mono',
    closeable: true,
    durations: 5000,
    group: 'max',
  })
}
</script>

<template>
  <PMessage group="max" :max="5" width="220" position="bottom" />

  <PButton @click="addMessage()">Add</PButton>
</template>
```

## Expand
Set `expand` prop to `true` to expand the message content.

```vue demo
<script setup>
import { useMessage } from 'pxd'

function addMessage() {
  useMessage('Now it\'s:' + Date.now(), {
    closeable: true,
    group: 'expand'
  })
}
</script>

<template>
  <PMessage group="expand" expand position="bottom" />

  <PButton @click="addMessage()">Add</PButton>
</template>
```

## Manual Clear

```vue demo
<script setup>
import { shallowRef } from 'vue'
import { useMessage, closeMessage, clearMessage } from 'pxd'

let lastKey = 0
const messageRef = shallowRef()

function addMessage() {
  useMessage('Now it\'s:' + Date.now(), {
    id: ++lastKey,
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
