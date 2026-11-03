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

## Async Sources

An item's `src` can be a function returning a promise of the URL. The component resolves it once per item, and the `loading` / `error` slots replace the viewer image while it is pending or after it rejects.

```vue demo
<script setup>
function createImage(label, color) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="1200" height="800" fill="${color}"/><text x="600" y="660" fill="#fff" font-family="sans-serif" font-size="160" font-weight="600" text-anchor="middle">${label}</text></svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function loadImage(label, color) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(createImage(label, color)), 800)
  })
}

const images = [
  { src: () => loadImage('1', '#2563eb'), alt: 'Blue cover' },
  { src: () => loadImage('2', '#059669'), alt: 'Green cover' },
]
</script>

<template>
  <PImagePreview :data="images">
    <template #loading="{ index }">
      <span class="size-full flex items-center justify-center text-sm text-white/70">
        Loading image {{ index + 1 }}…
      </span>
    </template>
  </PImagePreview>
</template>
```

## On-demand Requests

`request` fires when the viewer opens or switches to an image, so the host can fetch that item and write the resolved URL back into `data`.

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
const requested = ref([])

function onRequest(index) {
  requested.value = [...new Set([...requested.value, index])]
}
</script>

<template>
  <div class="gap-3 flex flex-col">
    <PImagePreview :data="images" @request="onRequest" />
    <span class="text-sm text-foreground-secondary">
      Requested: {{ requested.length ? requested.map((index) => index + 1).join(', ') : 'none' }}
    </span>
  </div>
</template>
```

## Viewer Only

With `variant="viewer"` the component renders nothing but the dialog, so it can be opened from any trigger through the exposed `open` method.

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
const preview = ref()

function open(index) {
  preview.value.open(index)
}
</script>

<template>
  <div class="gap-2 flex flex-wrap">
    <PButton v-for="(image, index) in images" :key="index" @click="open(index)">
      Image {{ index + 1 }}
    </PButton>

    <PImagePreview ref="preview" variant="viewer" :data="images" />
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | `(string \| ImagePreviewItem)[]` | - | Images rendered as thumbnails; an item's `src` is a URL or a function returning a promise of one |
| variant | `'default' \| 'viewer'` | `'default'` | Render the thumbnails together with the dialog, or the dialog alone |
| index | `number` | `0` | Image the preview opens at |
| z-index | `number` | - | Stacking order of the preview, applied through the `--image-preview-index` variable |
| close-on-press-escape | `boolean` | `true` | Close the preview when `Esc` is pressed |
| close-on-click-overlay | `boolean` | `true` | Close the preview when the area around the image is clicked |

## Events

| Name | Type | Description |
| --- | --- | --- |
| index-change | `(index: number) => void` | Emitted when the preview switches to another image. |
| request | `(index: number, item: ImagePreviewItem) => void` | Emitted when the viewer opens or switches to an image, so its source can be supplied on demand. |

## Slots

| Name | Description |
| --- | --- |
| item | Thumbnail content. Slot props: `image`, `index`, `src`, `status`. |
| loading | Viewer placeholder while the current source is loading. Slot props: `index`, `item`. |
| error | Viewer placeholder when the current source fails to load. Slot props: `index`, `item`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| open | `(index?: number) => void` | Open the preview at an optional image index. |
| close | `() => void` | Close the preview. |
| zoomIn | `() => void` | Increase the zoom by one step. |
| zoomOut | `() => void` | Decrease the zoom by one step. |
| rotate | `() => void` | Rotate the image by 90 degrees clockwise. |
| reset | `() => void` | Reset zoom, rotation and position. |
| download | `() => Promise<void>` | Download the current image to the local machine. |
