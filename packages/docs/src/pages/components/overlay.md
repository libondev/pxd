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
    <PButton
      ref="button"
      variant="error"
      :disabled="!isVisible"
      @click="onClickToClose"
    >
      Close
    </PButton>
  </PStack>

  <POverlay
    v-model="isVisible"
    :shown-element="btn"
    :close-on-press-escape="false"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| z-index | `number` | - | Stacking order of the overlay, applied through the `--overlay-index` variable |
| variant | `'default' \| 'blurred' \| 'transparent'` | - | Backdrop treatment; `blurred` adds a backdrop blur, `transparent` fades out |
| model-value | `boolean` | `false` | Whether the overlay is visible |
| show-overlay | `boolean` | `true` | Render the backdrop; `false` keeps only the slotted content |
| append-to-body | `boolean` | `true` | Teleport the content to `body` to escape overflow containers |
| shown-element | `string \| object` | - | Element or selector kept above the overlay, cut out with a `clip-path` |
| close-on-press-escape | `boolean` | `true` | Close the overlay when `Esc` is pressed |
| close-on-click-overlay | `boolean` | `false` | Close the overlay when the backdrop is clicked |
| lock-scroll-on-visible | `boolean` | `true` | Prevent the page behind the overlay from scrolling |

## Events

| Name | Type | Description |
| --- | --- | --- |
| click | `(event: PointerEvent) => void` | Emitted when the backdrop is clicked. |
| escape | `(event: KeyboardEvent) => void` | Emitted when the Escape key is pressed while this overlay is the topmost open one and `close-on-press-escape` is set. |
| update:modelValue | `(value: boolean) => void` | Emitted with `false` after Escape, or after a backdrop click when `close-on-click-overlay` is set. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
