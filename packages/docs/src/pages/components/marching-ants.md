# Marching Ants

Click a target to draw an animated dashed outline around its visible shape. The target supports
`border-radius`, `clip-path`, and radial-gradient `mask-image`.

## Default

```vue demo
<template>
  <PMarchingAnts
    class="h-28 w-64 cursor-pointer flex items-center justify-center bg-primary text-primary-foreground rounded-xl"
  >
    Click to select
  </PMarchingAnts>
</template>
```

## Clip path

```vue demo
<template>
  <div class="flex flex-wrap items-center gap-8">
    <PMarchingAnts
      class="size-32 cursor-pointer bg-amber-400"
      style="clip-path: polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)"
    />

    <PMarchingAnts
      class="size-32 cursor-pointer bg-pink-500"
      style="clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)"
    />
  </div>
</template>
```

## Mask image

```vue demo
<template>
  <PMarchingAnts
    class="h-36 w-56 cursor-pointer bg-sky-500"
    style="mask-image: radial-gradient(ellipse 80% 60% at center, black 99%, transparent 100%); -webkit-mask-image: radial-gradient(ellipse 80% 60% at center, black 99%, transparent 100%)"
  />
</template>
```

## Appearance

```vue demo
<template>
  <PMarchingAnts
    class="h-28 w-64 cursor-pointer flex items-center justify-center bg-amber-100 text-amber-950 rounded-xl"
    color="var(--color-amber-700)"
    :line-size="3"
    :dash-size="12"
    :gap="6"
  >
    Custom dash
  </PMarchingAnts>
</template>
```

## Programmatic control

```vue demo
<script setup>
import { shallowRef } from 'vue'

const marchingAnts = shallowRef()
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <PMarchingAnts
      ref="marchingAnts"
      class="h-28 w-64 cursor-pointer flex items-center justify-center bg-primary text-primary-foreground rounded-xl"
    >
      Selectable target
    </PMarchingAnts>

    <PStack direction="vertical">
      <PButton @click="marchingAnts?.select()">Select</PButton>
      <PButton @click="marchingAnts?.deselect()">Deselect</PButton>
    </PStack>
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `ComponentAs` | `div` | Target element or component. |
| color | `string` | `#00ff88` | Outline color. |
| line-size | `string \| number` | `2` | Outline stroke width. |
| dash-size | `string \| number` | `8` | Length of each dash. |
| gap | `string \| number` | `4` | Distance between dashes. |

## Methods

| Name | Description |
| --- | --- |
| select | Draws the outline using the target's current shape. |
| deselect | Removes the active outline. |

## Slots

| Name | Description |
| --- | --- |
| default | Content rendered inside the target element. |
