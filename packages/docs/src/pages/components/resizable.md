# Resizable

Resizable panel groups

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const direction = ref('horizontal')
</script>

<template>
  <PStack direction="vertical">
    <PSwitchGroup v-model="direction">
      <PSwitch value="horizontal">Row</PSwitch>
      <PSwitch value="vertical">Col</PSwitch>
    </PSwitchGroup>

    <PResizable :direction="direction" class="w-100 h-50 max-w-full border rounded-lg">
      <PResizablePanel class="flex items-center justify-center"> One </PResizablePanel>
      <PResizableHandle />
      <PResizablePanel class="flex items-center justify-center"> Two </PResizablePanel>
    </PResizable>
  </PStack>
</template>
```

## Nested

```vue demo
<template>
  <PResizable class="w-100 h-100 max-w-full border rounded-lg">
    <PResizablePanel class="flex items-center justify-center"> One </PResizablePanel>
    <PResizableHandle />
    <PResizablePanel class="flex items-center justify-center">
      <PResizable direction="vertical">
        <PResizablePanel class="flex items-center justify-center"> One </PResizablePanel>
        <PResizableHandle />
        <PResizablePanel class="flex items-center justify-center"> Two </PResizablePanel>
      </PResizable>
    </PResizablePanel>
  </PResizable>
</template>
```

## Sizes

```vue demo
<template>
  <PResizable class="w-100 h-100 max-w-full border rounded-lg">
    <PResizablePanel :size="50" class="flex items-center justify-center"> One </PResizablePanel>
    <PResizableHandle />
    <PResizablePanel :min-size="50" class="flex items-center justify-center"> Two </PResizablePanel>
  </PResizable>
</template>
```
