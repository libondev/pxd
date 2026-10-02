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

## Controlled

`v-model` holds the panel sizes as percentages in DOM order. Leave it off to let the group
manage its own sizes; read them back from a template ref with `getPanelSizes()`.

```vue demo
<script setup>
import { ref } from 'vue'

const sizes = ref([25, 75])
</script>

<template>
  <PStack direction="vertical" gap="3">
    <PStack align="center" gap="3">
      <PButton size="sm" @click="() => (sizes = [50, 50])">Reset</PButton>
      <PText secondary>{{ sizes.map((size) => size + '%').join(' / ') }}</PText>
    </PStack>

    <PResizable v-model="sizes" class="w-100 h-50 max-w-full border rounded-lg">
      <PResizablePanel class="flex items-center justify-center"> One </PResizablePanel>
      <PResizableHandle with-handle aria-label="Resize the panels" />
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

`size` is **only the starting point**. It is read once, when the group is first laid out, and
nothing re-applies it afterwards: dragging does not write back to it, and changing it later does
not move the panel. That is deliberate - a prop that re-applied itself would undo every drag the
moment the parent re-rendered. Use `v-model` when the sizes have to live somewhere else.

```vue demo
<template>
  <PResizable class="w-100 h-100 max-w-full border rounded-lg">
    <PResizablePanel :size="30" class="flex items-center justify-center"> One (30%) </PResizablePanel>
    <PResizableHandle with-handle />
    <PResizablePanel :min-size="20" class="flex items-center justify-center"> Two (min 20%) </PResizablePanel>
  </PResizable>
</template>
```

## Bounds

A panel never goes below `min-size` or above `max-size`. A neighbour that already sits at its
bound absorbs nothing, so the handle simply stops there.

```vue demo
<template>
  <PResizable class="w-100 h-50 max-w-full border rounded-lg">
    <PResizablePanel :size="30" :min-size="20" :max-size="50" class="flex items-center justify-center">
      One (20 - 50%)
    </PResizablePanel>
    <PResizableHandle with-handle />
    <PResizablePanel :min-size="25" class="flex items-center justify-center"> Two (min 25%) </PResizablePanel>
  </PResizable>
</template>
```

## Collapse

Double clicking a handle folds the panel before it down to its `min-size` and hands the space to
its neighbour; double clicking again gives the pair back the exact sizes it had. Dragging a
collapsed pair also expands it, so a collapsed panel is never a dead end.

`aria-expanded` on the handle mirrors the state, and `data-collapsed` is there for styling.

```vue demo
<template>
  <PResizable class="w-100 h-50 max-w-full border rounded-lg">
    <PResizablePanel :size="30" class="flex items-center justify-center"> One </PResizablePanel>
    <PResizableHandle with-handle aria-label="Collapse One" />
    <PResizablePanel class="flex items-center justify-center"> Two </PResizablePanel>
  </PResizable>
</template>
```

## Keyboard

Every handle is a focusable `separator`: arrow keys move it by 1%, holding shift by 10%, and
`Home` / `End` snap it to its bounds. Give it an `aria-label` so it has a name.

```vue demo
<template>
  <PResizable class="w-100 h-50 max-w-full border rounded-lg">
    <PResizablePanel :size="50" class="flex items-center justify-center"> One </PResizablePanel>
    <PResizableHandle with-handle aria-label="Resize One and Two" />
    <PResizablePanel :size="50" class="flex items-center justify-center"> Two </PResizablePanel>
  </PResizable>
</template>
```

Double clicking a handle collapses the panel before it, see [Collapse](#collapse).

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| direction | `'horizontal' \| 'vertical'` | `horizontal` | Axis along which the panels are laid out and resized |
| model-value | `number[] \| null` | `null` | Panel sizes as percentages in DOM order; unset means the group keeps them itself |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(sizes: number[]) => void` | Emitted when a drag, a key press, or a double click commits new panel sizes. |
| reset | `(sizes: number[]) => void` | Emitted when the panels are put back to their configured sizes. |
| update:modelValue | `(sizes: number[]) => void` | Emitted whenever a panel size changes. |

## ResizablePanel Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| id | `string` | - | DOM id for the panel, referenced by the handles around it; generated when omitted |
| size | `number \| null` | `null` | Starting width or height as a percentage; `null` or `0` shares the remaining space |
| min-size | `number` | `0` | Smallest allowed size as a percentage of the container |
| max-size | `number` | `100` | Largest allowed size as a percentage of the container |

## ResizableHandle Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| with-handle | `boolean` | - | Draw the grip in the middle of the handle |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |

## ResizablePanel Slots

| Name | Description |
| --- | --- |
| default | Default slot |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| getPanelSizes | `() => number[]` | Read the current panel sizes as percentages in DOM order. |
| reset | `(handleKey?: string) => void` | Restore the configured sizes and expand collapsed pairs, for one handle's pair or for the whole group when no key is given. |
