# Shimmer Text

Give your text a shimmer sweep effect.

> Inspiration comes from <PLinkButton class="!px-0" variant="link" target="_blank" text="BIAsia/gradient-shimmer" href="https://github.com/BIAsia/gradient-shimmer" external-icon />

## Default

```vue demo
<template>
  <PShimmerText>
    Lorem ipsum dolor
  </PShimmerText>
</template>
```

## Variant

Use `variant` to apply built-in gradient presets. When `color` is not set, the preset defined by `variant` is used.

```vue demo
<template>
  <PStack direction="vertical" :gap="4">
    <PShimmerText>default</PShimmerText>
    <PShimmerText variant="sunrise">sunrise</PShimmerText>
    <PShimmerText variant="bubble">bubble</PShimmerText>
    <PShimmerText variant="tonic">tonic</PShimmerText>
    <PShimmerText variant="spring">spring</PShimmerText>
    <PShimmerText variant="twilight">twilight</PShimmerText>
  </PStack>
</template>
```

## Custom Color

Pass a string to `color` for a single-color highlight band.

```vue demo
<template>
  <PShimmerText color="var(--color-amber-500)">
    Custom highlight color
  </PShimmerText>
</template>
```

## Custom Gradient

Pass an array of color stops to `color` for a multi-color gradient band. Each stop has `color` and `position` (0–1).

```vue demo
<template>
  <PShimmerText

    :color="[
      { color: '#EF9B62', position: 0 },
      { color: '#A0C4E8', position: 0.5 },
      { color: '#F888A0', position: 1 },
    ]"
  >
    Custom gradient band
  </PShimmerText>
</template>
```

## Text

Use the `text` prop or the default slot to set the content.

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
    <PShimmerText text="Content via text prop" />
    <PShimmerText>Content via default slot</PShimmerText>
  </PStack>
</template>
```

## Duration

```vue demo
<template>
  <PStack direction="vertical" :gap="4">
    <PShimmerText :durations="800">
      Faster shimmer
    </PShimmerText>
    <PShimmerText :durations="2000">
      Slower shimmer
    </PShimmerText>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | `string` | - | Text content. Used when the default slot is empty. |
| color | `string \| { color: string; position: number }[]` | - | Highlight color. A string uses a single-color band; a non-empty array uses a custom multi-stop gradient. When omitted, `variant` is used. |
| variant | `'sunrise' \| 'bubble' \| 'tonic' \| 'spring' \| 'twilight'` | - | Built-in gradient preset. Used when `color` is not set. |
| durations | `number` | `1500` | Sweep duration in milliseconds. |

## Slots

| Name | Description |
| --- | --- |
| default | Text content. Falls back to the `text` prop when empty. |
