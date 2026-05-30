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
    <PSwitch v-model="direction">
      <PSwitchItem value="horizontal">Row</PSwitchItem>
      <PSwitchItem value="vertical">Col</PSwitchItem>
    </PSwitch>

    <PResizable :direction="direction" class="w-100 h-50 max-w-full border rounded-lg">
      <PResizablePanel class="flex items-center justify-center"> One </PResizablePanel>
      <PResizableHandle with-handle />
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
    <PResizableHandle with-handle />
    <PResizablePanel class="flex items-center justify-center">
      <PResizable direction="vertical">
        <PResizablePanel class="flex items-center justify-center"> One </PResizablePanel>
        <PResizableHandle with-handle />
        <PResizablePanel class="flex items-center justify-center"> Two </PResizablePanel>
      </PResizable>
    </PResizablePanel>
  </PResizable>
</template>
```

## Sizes

unit: %

```vue demo
<template>
  <PResizable class="w-100 h-100 max-w-full border rounded-lg">
    <PResizablePanel :size="30" class="flex items-center justify-center"> One (30%) </PResizablePanel>
    <PResizableHandle with-handle />
    <PResizablePanel :min-size="20" class="flex items-center justify-center"> Two (min 20%) </PResizablePanel>
  </PResizable>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| direction | `'horizontal' \| 'vertical'` | `horizontal` | - |

## ResizablePanel Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `number \| null` | `null` | - |
| min-size | `number` | `0` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

## ResizablePanel Slots

| Name | Description |
| --- | --- |
| default | Default slot |
