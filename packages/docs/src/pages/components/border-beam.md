# Border Beam

Animated border beam component. The beam follows the `border-radius` of the outermost element.

> Inspiration comes from<PLinkButton class="!px-0" variant="link" target="_blank" text="Border Beam" href="https://beam.jakubantalik.com/" external-icon />

## Default

```vue demo
<template>
  <PBorderBeam
    class="h-28 w-64 flex items-center justify-center bg-background-100 rounded-xl shadow-border-base"
  >
    Border beam
  </PBorderBeam>
</template>
```

## Variant

Use `variant="line"` for a 1px beam that travels along the border. The default `glow` variant keeps the broader light.

```vue demo
<template>
  <PStack>
    <PBorderBeam
      variant="glow"
      class="h-28 w-64 flex items-center justify-center bg-background-100 rounded-xl shadow-border-base"
    >
      glow
    </PBorderBeam>

    <PBorderBeam
      variant="line"
      class="h-10 w-64 flex items-center justify-center bg-background-100 rounded-full shadow-border-base"
    >
      line
    </PBorderBeam>

    <PBorderBeam
      variant="line"
      class="h-28 w-64 flex items-center justify-center bg-background-100 rounded-xl shadow-border-base"
    >
      line
    </PBorderBeam>
  </PStack>
</template>
```

## Border Radius

The effect inherits the `border-radius` set via class or style.

```vue demo
<template>
  <PStack>
    <PBorderBeam
      class="h-28 w-64 flex items-center shadow-border-base justify-center bg-background-100 rounded-full"
    >
      rounded-full
    </PBorderBeam>

    <PBorderBeam
      class="h-28 w-64 flex items-center shadow-border-base justify-center bg-background-100"
      style="border-radius: 4px"
    >
      4px
    </PBorderBeam>
  </PStack>
</template>
```

## Strength

Use `strength` to scale the overall effect intensity (0-1). It only affects the beam, glow, and bloom layers, not the content.

```vue demo
<template>
  <PStack>
    <PBorderBeam
      class="h-28 w-64 flex items-center shadow-border-base justify-center bg-background-100 rounded-xl"
      :strength="0.4"
    >
      0.4
    </PBorderBeam>

    <PBorderBeam
      class="h-28 w-64 flex items-center shadow-border-base justify-center bg-background-100 rounded-xl"
      :strength="1"
    >
      1
    </PBorderBeam>
  </PStack>
</template>
```

## Color

Use `color` to override the beam colors. Pass a string for a single color, or an array of color values to distribute multiple colors around the border.

```vue demo
<template>
  <PStack>
    <PBorderBeam
      class="h-28 w-64 flex items-center shadow-border-base justify-center bg-background-100 rounded-xl"
      color="var(--color-primary)"
    >
      single color
    </PBorderBeam>

    <PBorderBeam
      class="h-28 w-64 flex items-center shadow-border-base justify-center bg-background-100 rounded-xl"
      :color="['var(--color-pink-700)', 'var(--color-purple-700)', 'var(--color-blue-700)']"
    >
      multiple colors
    </PBorderBeam>
  </PStack>
</template>
```

## Disabled

Use `disabled` to stop the animation. The beam freezes first, then shrinks and fades out instead of disappearing instantly.

```vue demo
<script setup>
import { shallowRef } from 'vue'

const disabled = shallowRef(false)
</script>

<template>
  <PStack direction="vertical" :gap="4">
    <PBorderBeam
      class="h-28 w-64 flex items-center shadow-border-base justify-center bg-background-100 rounded-xl"
      :disabled="disabled"
    >
      {{ disabled ? 'disabled' : 'enabled' }}
    </PBorderBeam>

    <PButton @click="disabled = !disabled">Toggle</PButton>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `'glow' \| 'line'` | `'glow'` | Beam appearance. `glow` is the broader light effect; `line` is a 1px beam that travels along the border. |
| color | `string \| string[]` | - | Override the beam colors. A string uses one color for all spots; an array distributes colors around the border. |
| strength | `number` | `1` | Overall effect intensity (0-1). Only affects the beam, glow, and bloom layers. |
| disabled | `boolean` | `false` | Stop the animation. The beam freezes, then shrinks and fades out. |
