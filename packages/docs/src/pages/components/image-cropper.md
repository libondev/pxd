# Image Cropper

Choose the part of an image to keep by moving and resizing a selection, or by panning and zooming the image under a fixed frame.

## Default

Drag the selection or one of its handles, then press Crop. Tab to the selection and use the arrow keys, with Shift to move further. Press `R` to turn the image a quarter clockwise, `Shift+R` to turn it back, and `+` / `-` to zoom. The crop is a box in the image's own pixels, with its quarter-turn rotation and flips, ready to pass to `toFile()`.

Cross-origin images load without a CORS request by default, so a server without CORS headers still displays. To export one with `toFile()`, set `crossorigin="anonymous"` and have the server return CORS headers.

```vue demo
<script setup>
import { onBeforeUnmount, ref } from 'vue'

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`

const cropper = ref()
const result = ref()

async function crop() {
  const file = await cropper.value.toFile({ width: 320 })

  if (result.value) {
    URL.revokeObjectURL(result.value)
  }

  result.value = URL.createObjectURL(file)
}

onBeforeUnmount(() => result.value && URL.revokeObjectURL(result.value))
</script>

<template>
  <div class="gap-3 flex flex-col" style="max-width: 640px">
    <PImageCropper
      ref="cropper"
      :src="photo"
      alt="Mountains at sunset"
      aria-label="Photo"
      :min-width="64"
      :min-height="64"
    />

    <div class="gap-3 flex items-center">
      <PButton variant="primary" @click="crop">Crop</PButton>
      <img
        v-if="result"
        :src="result"
        alt="Cropped result"
        class="size-20 rounded-md object-cover"
      />
    </div>
  </div>
</template>
```

## Aspect Ratio

Set `aspect-ratio` to keep the crop's width over its height, like `1` for a square or `16 / 9`. Changing it fits the crop to the new ratio about its middle.

```vue demo
<script setup>
import { ref } from 'vue'

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`

const ratios = [
  { label: 'Free', value: undefined },
  { label: 'Square', value: 1 },
  { label: 'Wide', value: 16 / 9 },
]

const aspect = ref()
</script>

<template>
  <div class="gap-3 flex flex-col" style="max-width: 640px">
    <div class="gap-2 flex flex-wrap">
      <PButton
        v-for="ratio in ratios"
        :key="ratio.label"
        size="sm"
        :variant="aspect === ratio.value ? 'primary' : 'ghost'"
        @click="aspect = ratio.value"
      >
        {{ ratio.label }}
      </PButton>
    </div>

    <PImageCropper
      :src="photo"
      alt="Mountains at sunset"
      aria-label="Photo"
      :aspect-ratio="aspect"
      :min-width="64"
      :min-height="64"
    />
  </div>
</template>
```

## Frame Mode

With `mode="frame"` the selection stays still and as large as it fits. Drag the image under it to pan, and zoom with the wheel, a pinch, or the zoom buttons. Handles are hidden in a frame. `shape="circle"` rounds the selection while the crop stays its box, and `toFile()` writes the same shape. PNG and WebP keep the corners transparent; JPEG fills them.

```vue demo
<script setup>
import { onBeforeUnmount, ref } from 'vue'

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`

const cropper = ref()
const avatar = ref()

async function save() {
  const file = await cropper.value.toFile({ width: 128, height: 128 })

  if (avatar.value) {
    URL.revokeObjectURL(avatar.value)
  }

  avatar.value = URL.createObjectURL(file)
}

onBeforeUnmount(() => avatar.value && URL.revokeObjectURL(avatar.value))
</script>

<template>
  <div class="gap-3 flex flex-col" style="max-width: 480px">
    <PImageCropper
      ref="cropper"
      :src="photo"
      alt="Mountains at sunset"
      aria-label="Profile photo"
      mode="frame"
      shape="circle"
      :aspect-ratio="1"
      :max-zoom="4"
    />

    <div class="gap-3 flex items-center">
      <PButton variant="primary" @click="save">Save Avatar</PButton>
      <img
        v-if="avatar"
        :src="avatar"
        alt="Your new avatar"
        class="size-16 rounded-full object-cover"
      />
    </div>
  </div>
</template>
```

## Actions Slot

The `actions` slot adds controls to the toolbar, after the zoom buttons. It receives the current `crop` and `zoom`.

```vue demo
<script setup>
import { onBeforeUnmount, ref } from 'vue'

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`

const cropper = ref()
const result = ref()

async function crop() {
  const file = await cropper.value.toFile()

  if (result.value) {
    URL.revokeObjectURL(result.value)
  }

  result.value = URL.createObjectURL(file)
}

onBeforeUnmount(() => result.value && URL.revokeObjectURL(result.value))
</script>

<template>
  <div class="gap-3 flex flex-col" style="max-width: 640px">
    <PImageCropper
      ref="cropper"
      :src="photo"
      alt="Mountains at sunset"
      aria-label="Photo"
    >
      <template #actions="{ zoom }">
        <PButton size="sm" variant="primary" @click="crop">
          Crop {{ Math.round(zoom * 100) }}%
        </PButton>
      </template>
    </PImageCropper>

    <img
      v-if="result"
      :src="result"
      alt="Cropped result"
      class="max-w-40 rounded-md"
    />
  </div>
</template>
```

## Disabled

```vue demo
<script setup>
const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`
</script>

<template>
  <PImageCropper
    :src="photo"
    alt="Mountains at sunset"
    aria-label="Photo"
    disabled
    style="max-width: 640px"
  />
</template>
```

## Controlled

Bind `v-model:crop` to read and write the crop. `crop-change` carries the reason for every step, and `crop-commit` fires once an interaction ends.

```vue demo
<script setup>
import { ref } from 'vue'

const photo = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="420"><rect width="640" height="420" fill="#e5e5e5"/><circle cx="460" cy="150" r="56" fill="#fafafa"/><path d="M0 280 120 170l110 100 120-130 130 125 90-60 70 40v175H0z" fill="#a3a3a3"/><path d="M0 330l160-80 120 70 150-80 210 85v95H0z" fill="#525252"/><path d="M0 380q160-35 320-10t320-5v55H0z" fill="#262626"/></svg>`
)}`

const crop = ref()
const committed = ref()
</script>

<template>
  <div class="gap-3 flex flex-col" style="max-width: 640px">
    <PImageCropper
      v-model:crop="crop"
      :src="photo"
      alt="Mountains at sunset"
      aria-label="Photo"
      @crop-commit="committed = $event"
    />

    <pre class="p-3 text-xs overflow-auto rounded-md border bg-background-200">{{ committed ?? crop }}</pre>
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| src | `string` | - | The image URL or data URL to crop |
| alt | `string` | `''` | Alternative text for the image |
| crossorigin | `'' \| 'anonymous' \| 'use-credentials' \| null` | - | CORS mode for the image; unset by default so servers without CORS headers still display |
| crop | `ImageCrop \| null` | - | Controlled crop; bind it with `v-model:crop` |
| default-crop | `ImageCrop` | - | Crop used when no crop is supplied yet, fitted to `aspect-ratio` |
| mode | `'box' \| 'frame'` | `'box'` | Move and resize a selection, or pan and zoom the image under a fixed frame |
| aspect-ratio | `number` | - | Keeps the crop's width over its height |
| shape | `'rectangle' \| 'circle'` | `'rectangle'` | Shape of the selection and the exported crop |
| min-width | `number` | `1` | Narrowest the crop gets, in image pixels |
| min-height | `number` | `1` | Shortest the crop gets, in image pixels |
| max-zoom | `number` | `10` | How far the crop magnifies the image |
| disabled | `boolean` | `false` | Stops the selection, handles and toolbar from changing the crop |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:crop | `(crop: Required<ImageCrop>) => void` | Emitted whenever the crop changes, including while a drag is in progress. |
| crop-change | `(crop: Required<ImageCrop>, details: ImageCropperCropChangeDetails) => void` | Emitted on every crop step; call `details.cancel()` to keep the current crop. |
| crop-commit | `(crop: Required<ImageCrop>, details: ImageCropperCropCommitDetails) => void` | Emitted once when a drag, key press or wheel interaction that changed the crop ends. |
| load | `(size: ImageCropperNaturalSize) => void` | Emitted when the image loads, with its natural size. |
| error | `(event: Event) => void` | Emitted when the image fails to load. |

`ImageCropperCropChangeDetails` extends `ChangeDetails<ImageCropperCropChangeReason>` and adds a `reason` such as `'drag'`, `'step-key'`, `'wheel'`, `'rotate-press'` or `'api'`.

## Slots

| Name | Description |
| --- | --- |
| loading | Placeholder while the image loads. |
| error | Placeholder when the image fails to load. |
| actions | Extra toolbar controls. Slot props: `crop`, `zoom`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| getCrop | `() => Required<ImageCrop> \| null` | Return the current crop, or `null` until the image loads. |
| setCrop | `(crop: ImageCrop) => boolean` | Set the crop and commit it, returning whether it changed. |
| rotate | `(direction?: 1 \| -1) => boolean` | Turn the image a quarter clockwise, or counterclockwise with `-1`. |
| flip | `(direction?: ImageCropperFlipDirection) => boolean` | Mirror the image left to right, or top to bottom. |
| getZoom | `() => number` | Return how far the crop magnifies the image. |
| setZoom | `(zoom: number) => boolean` | Zoom about the crop's middle and commit it. |
| toFile | `(options?: ImageCropperFileOptions) => Promise<File>` | Export the current crop as an image file; a cross-origin image needs CORS headers and `crossorigin="anonymous"`. |
