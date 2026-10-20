# Image Preview

A thumbnail strip that opens a full-screen viewer with zoom, rotation, panning and gallery navigation.

## Default

```vue demo
<script setup>
function createImage(label, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${color}"/><text x="600" y="660" fill="#fff" font-family="sans-serif" font-size="160" font-weight="600" text-anchor="middle">${label}</text></svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const images = [{ src: createImage('1', '#2563eb'), alt: 'Blue cover' }]
</script>

<template>
  <PImagePreview :data="images" />
</template>
```

## Gallery

With more than one image the viewer shows the current position and lets you switch with the arrows or the keyboard.

```vue demo
<script setup>
function createImage(label, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${color}"/><text x="600" y="660" fill="#fff" font-family="sans-serif" font-size="160" font-weight="600" text-anchor="middle">${label}</text></svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const images = [
  { src: createImage('1', '#2563eb'), alt: 'Blue cover' },
  { src: createImage('2', '#059669'), alt: 'Green cover' },
  { src: createImage('3', '#d97706'), alt: 'Amber cover' },
]
</script>

<template>
  <PImagePreview :data="images" />
</template>
```

## Custom Thumbnail


```vue demo
<script setup>
function createImage(label, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${color}"/><text x="600" y="660" fill="#fff" font-family="sans-serif" font-size="160" font-weight="600" text-anchor="middle">${label}</text></svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

const images = [
  { src: createImage('1', '#2563eb'), alt: 'Blue cover' },
  { src: createImage('2', '#059669'), alt: 'Green cover' },
  { src: createImage('3', '#d97706'), alt: 'Amber cover' },
]
</script>

<template>
  <PImagePreview :data="images">
    <template #item="{ index }">
      <span class="size-full flex items-center justify-center bg-gray-100 text-foreground-secondary">
        {{ index + 1 }}
      </span>
    </template>
  </PImagePreview>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | `(string \| ImagePreviewItem)[]` | - | Images rendered as thumbnails; a URL string or an object with `src` and an optional `alt` |
| index | `number` | `0` | Image the preview opens at |
| z-index | `number` | - | Stacking order of the preview, applied through the `--image-preview-index` variable |
| close-on-press-escape | `boolean` | `true` | Close the preview when `Esc` is pressed |
| close-on-click-overlay | `boolean` | `true` | Close the preview when the area around the image is clicked |

## Events

| Name | Type | Description |
| --- | --- | --- |
| index-change | `(index: number) => void` | Emitted when the preview switches to another image. |

## Slots

| Name | Description |
| --- | --- |
| item | Thumbnail content. Slot props: `image`, `index`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| open | `(index?: number) => void` | Open the preview at an optional image index. |
| close | `() => void` | Close the preview. |
| zoomIn | `() => void` | Increase the zoom by one step. |
| zoomOut | `() => void` | Decrease the zoom by one step. |
| rotate | `() => void` | Rotate the image by 90 degrees clockwise. |
| reset | `() => void` | Reset zoom, rotation and position. |
