# Teleport

Provide 2.7 with behavior similar to the `<Teleport>` component built in 3.

## Default

```vue demo
<script setup>
import { ref, onMounted } from 'vue'

// Ensure that the target node has been mounted before switching
const isRender = ref(false)
const renderDisabled = ref(false)

function toggleTeleport() {
  renderDisabled.value = !renderDisabled.value
}

onMounted(() => {
  isRender.value = true
})
</script>

<template>
  <PButton variant="primary" @click="toggleTeleport">Toggle</PButton>

  <div
    id="target"
    class="w-40 h-40 bg-background-200 rounded-md p-2 my-2 border border-dashed"
  ></div>

  <PTeleport v-if="isRender" to="#target" :disabled="renderDisabled">
    <PButton> render {{ renderDisabled ? 'outside' : 'inside' }} </PButton>
  </PTeleport>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| to | `string \| object` | `body` | - |
| disabled | `boolean` | - | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
