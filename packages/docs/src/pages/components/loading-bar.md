# LoadingBar
Display the progress of a page or action.

## Default

```vue demo
<script setup>
import { useLoadingBar } from 'pxd'

function start() {
  useLoadingBar.start()
}

function error() {
  useLoadingBar.error()
}

function finish() {
  useLoadingBar.finish()
}
</script>

<template>
  <PStack>
    <PLoadingBar></PLoadingBar>

    <PButton @click="start">Start</PButton>
    <PButton @click="error">Error</PButton>
    <PButton @click="finish">Finish</PButton>
  </PStack>
</template>
```

## Manually
Like `<Message/>`, there can be multiple `<LoadingBar/>` components, but there may be different parameter configurations between different instances, and you can distinguish them by setting group

```vue demo
<script setup>
import { useLoadingBar } from 'pxd'

function start() {
  useLoadingBar.start('manually')
}

function finish() {
  useLoadingBar.finish('manually')
}

function increase() {
  useLoadingBar.increase('manually', 0.1)
}
</script>

<template>
  <PStack>
    <PLoadingBar group="manually" :trickle="false"></PLoadingBar>

    <PButton @click="start">Start</PButton>
    <PButton @click="increase">Increase</PButton>
    <PButton @click="finish">Finish</PButton>
  </PStack>
</template>
```
