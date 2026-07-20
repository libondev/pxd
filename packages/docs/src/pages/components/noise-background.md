# Noise Background

Overlay a noise texture on a container to add visual depth to its background and contents.

## Default

```vue demo
<template>
  <PNoiseBackground class="w-100 h-100 p-4 max-w-full border rounded-lg">
    Lorem ipsum dolor sit amet consectetur adipisicing elit. Omnis aliquid molestias fugit eos
    dolorum dolore, quisquam, quidem temporibus laboriosam voluptatibus obcaecati cumque sint?
    Corporis labore praesentium natus error perspiciatis nemo.
  </PNoiseBackground>
</template>
```

## Content blending

The noise layer is rendered above the slot content. Use `blend-mode` to blend the texture with the
container's background, text, images, and other contents. The blending is isolated from elements
outside the component.

```vue demo
<template>
  <PNoiseBackground
    class="w-100 h-64 p-6 max-w-full overflow-hidden bg-[#e6ff55] text-black rounded-lg"
    color="#151515"
    blend-mode="overlay"
    :opacity="0.18"
  >
    <div class="h-full flex flex-col justify-between">
      <div class="text-4xl font-bold">NOISE<br />OVER CONTENT</div>
      <div class="flex items-end justify-between gap-4">
        <span class="max-w-56 text-sm">The same texture is blended across the background and text.</span>
        <span class="size-20 bg-[#ff4f3d] rounded-full" />
      </div>
    </div>
  </PNoiseBackground>
</template>
```

## Blend modes

```vue demo
<template>
  <div class="grid gap-4 sm:grid-cols-3">
    <PNoiseBackground
      v-for="mode in ['overlay', 'soft-light', 'multiply']"
      :key="mode"
      class="h-32 p-4 bg-[#5bd6c0] text-black rounded-lg"
      color="#ff3d71"
      :blend-mode="mode"
      :opacity="0.22"
    >
      <strong class="text-lg">{{ mode }}</strong>
    </PNoiseBackground>
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `div` | Root element or component. |
| blendMode | `CSSProperties['mixBlendMode']` | `normal` | CSS blend mode used by the noise layer. |
| color | `string` | `currentColor` | Color of the noise texture. |
| opacity | `number` | `0.05` | Opacity of the noise layer. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
