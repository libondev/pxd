# Image Compare

Compare two versions of the same image with a draggable divider. The `leading` slot fills the side before the divider and the `trailing` slot fills the side after it. The component owns the divider position; you own the content and the frame styles, so it has no props or events.

## Default

Drag anywhere on the frame, click or tap to place the divider, or focus the frame and use the arrow keys. Hold Shift for a larger step; Home and End go to the edges.

Give the component a size with `class` or `style`; it has no width, height, or radius of its own. The images below use `size-full object-cover`, and the frame gets its rounding from `rounded-xl`.

```vue demo
<script setup>
const scene = (sky, sun, hill, ground) => `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="${sky}" />
    <circle cx="500" cy="120" r="56" fill="${sun}" />
    <path d="M0 300 130 180l110 100 120-140 150 150 80-70 50 40v220H0z" fill="${hill}" />
    <path d="M0 360q160-40 320-10t320-20v150H0z" fill="${ground}" />
  </svg>
`)}`

const leading = scene('#e5e5e5', '#fafafa', '#a3a3a3', '#525252')
const trailing = scene('#bae6fd', '#fef3c7', '#34d399', '#1e293b')
</script>

<template>
  <PImageCompare
    class="aspect-[4/3] w-full max-w-xl rounded-xl"
    aria-label="Before and after comparison"
  >
    <template #leading>
      <img :src="leading" alt="" class="size-full object-cover" draggable="false" />
    </template>

    <template #trailing>
      <img :src="trailing" alt="" class="size-full object-cover" draggable="false" />
    </template>
  </PImageCompare>
</template>
```

## Labels

Labels are slot content too. A label inside the leading layer is clipped with that layer as the divider passes; place it where it reads best for the comparison.

```vue demo
<script setup>
const scene = (sky, sun, hill, ground) => `data:image/svg+xml,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="640" height="480" viewBox="0 0 640 480">
    <rect width="640" height="480" fill="${sky}" />
    <circle cx="500" cy="120" r="56" fill="${sun}" />
    <path d="M0 300 130 180l110 100 120-140 150 150 80-70 50 40v220H0z" fill="${hill}" />
    <path d="M0 360q160-40 320-10t320-20v150H0z" fill="${ground}" />
  </svg>
`)}`

const leading = scene('#e5e5e5', '#fafafa', '#a3a3a3', '#525252')
const trailing = scene('#bae6fd', '#fef3c7', '#34d399', '#1e293b')
</script>

<template>
  <PImageCompare
    class="aspect-[4/3] w-full max-w-xl rounded-xl"
    aria-label="X-ray and color photograph comparison"
  >
    <template #leading>
      <img :src="leading" alt="" class="size-full object-cover" draggable="false" />
      <span
        class="px-3 py-1 text-xs absolute left-3 top-3 rounded-full text-white bg-black/40 backdrop-blur-sm pointer-events-none"
      >
        Before
      </span>
    </template>

    <template #trailing>
      <img :src="trailing" alt="" class="size-full object-cover" draggable="false" />
      <span
        class="px-3 py-1 text-xs absolute right-3 top-3 rounded-full text-white bg-black/40 backdrop-blur-sm pointer-events-none"
      >
        After
      </span>
    </template>
  </PImageCompare>
</template>
```

## Slots

| Name | Description |
| --- | --- |
| leading | Content on the leading side of the divider; clipped at the divider. |
| trailing | Content on the trailing side of the divider; fills the whole frame behind the leading layer. |
