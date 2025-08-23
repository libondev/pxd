# Loading Bar
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

## Use loading bar locally
You can set mount target of loading by `to` prop.

```vue demo
<script setup>
import { ref, onMounted, nextTick } from 'vue'
import { useLoadingBar } from 'pxd'

const isRender = ref(false)

function start() {
  useLoadingBar.start('locally')
}

function finish() {
  useLoadingBar.finish('locally')
}


onMounted(() => {
  nextTick(() => {
    isRender.value = true
  })
})
</script>

<template>
  <PStack id="container" class="relative">
    <PLoadingBar v-if="isRender" to="#container" group="locally" class="-mt-6"></PLoadingBar>

    <PButton @click="start">Start</PButton>
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
