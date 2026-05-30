# Material

Various surfaces with shadows, built on top of `<Stack>`.

## Variants

```vue demo
<template>
  <PStack>
    <PMaterial variant="default" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">default</PPlaceholder>
    </PMaterial>
    <PMaterial variant="small" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">small</PPlaceholder>
    </PMaterial>
    <PMaterial variant="medium" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">medium</PPlaceholder>
    </PMaterial>
    <PMaterial variant="large" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">large</PPlaceholder>
    </PMaterial>
    <PMaterial variant="tooltip" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">tooltip</PPlaceholder>
    </PMaterial>
    <PMaterial variant="menu" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">menu</PPlaceholder>
    </PMaterial>
    <PMaterial variant="modal" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">modal</PPlaceholder>
    </PMaterial>
    <PMaterial variant="fullscreen" class="overflow-hidden">
      <PPlaceholder class="h-40 flex items-center justify-center">fullscreen</PPlaceholder>
    </PMaterial>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `'default' \| 'small' \| 'medium' \| 'large' \| 'tooltip' \| 'menu' \| 'modal' \| 'fullscreen'` | `default` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
