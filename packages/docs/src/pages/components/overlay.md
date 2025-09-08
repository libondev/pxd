# Overlay
Highlight certain contents.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const isVisible = ref(false)

function onClickToClose() {
  isVisible.value = false
}
</script>

<template>
  <PButton @click="isVisible = true">Open</PButton>
  <POverlay v-model="isVisible" @click="onClickToClose" />
</template>
```

## With shown element
Highlight and display a certain element.

```vue demo
<script setup>
import { ref, useTemplateRef } from 'vue'

const btn = useTemplateRef('button')
const isVisible = ref(false)

function onClickToClose() {
  isVisible.value = false
}
</script>

<template>
  <PStack>
    <PButton @click="isVisible = true">Open</PButton>
    <PButton ref="button" variant="error" :disabled="!isVisible" @click="onClickToClose">Close</PButton>
  </PStack>

  <POverlay v-model="isVisible" :shown-element="btn" :close-on-press-escape="false" />
</template>
```
