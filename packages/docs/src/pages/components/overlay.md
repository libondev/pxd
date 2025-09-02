# Overlay


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
  <PButton @click="isVisible = true">Open</PButton>
  <button @click="onClickToClose" ref="button" class="close-btn">Close</button>
  <POverlay v-model="isVisible" :shown-element="btn" :closeOnPressEscape="false" :closeOnClickOverlay="false" />
</template>

<style scoped>
.close-btn {
  width: 70px;
  height: 36px;
  background-color: #e24247;
  border-radius: calc(.5rem - 2px);
  margin: 0 12px;
  font-size: .875rem;
  color: #fff;
  transition: all 0.3s ease;
  cursor: pointer;
}
.close-btn:hover {
  opacity: 0.6;
}
</style>
```