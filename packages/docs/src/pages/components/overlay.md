# Overlay

a floating UI element that renders on top of the main application content to display temporary information, capture user input, or block interaction

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

## Blurred

When `variant="blurred"` is set, the overlay will be blurred.

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
  <POverlay v-model="isVisible" variant="blurred" @click="onClickToClose" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| z-index | `number` | - | Stacking order of the overlay, applied through the `--overlay-index` variable |
| variant | `'default' \| 'blurred' \| 'none'` | - | Backdrop treatment; `blurred` adds a backdrop blur, `none` renders no backdrop at all so only the slotted content is placed |
| model-value | `boolean` | `false` | Whether the overlay is visible |
| close-on-press-escape | `boolean` | `true` | Close the overlay when `Esc` is pressed |
| close-on-click-overlay | `boolean` | `false` | Close the overlay when the backdrop is clicked |
| lock-scroll-on-visible | `boolean` | `true` | Prevent the page behind the overlay from scrolling |

## Events

| Name | Type | Description |
| --- | --- | --- |
| click | `(event: PointerEvent) => void` | Emitted when the backdrop is clicked. |
| escape | `(event: KeyboardEvent) => void` | Emitted when Escape reaches this overlay: either it is the topmost one, or every overlay above it left the event unconsumed. Call `event.preventDefault()` to keep the overlay open. |
| update:modelValue | `(value: boolean) => void` | Emitted with `false` after Escape unless the `escape` handler prevented it, or after a backdrop click when `close-on-click-overlay` is set. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
