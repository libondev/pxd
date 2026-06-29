# Radial Burst

A comic-style sunburst background with slowly rotating radial rays. Use it to draw attention to centered content such as badges, icons, or call-to-action text.

## Default

```vue demo
<template>
  <PRadialBurst class="h-80">
    Radial Burst
  </PRadialBurst>
</template>
```

## Custom colors

Use `primary-color` for the ray color and `background-color` for the base fill.

```vue demo
<template>
  <PStack direction="vertical" gap="8">
    <PRadialBurst
      class="h-80"
      primary-color="var(--color-teal-500)"
      background-color="var(--color-teal-400)"
    >
      <PText class="font-semibold">Teal burst</PText>
    </PRadialBurst>

    <PRadialBurst
      class="h-80"
      primary-color="var(--color-gray-300)"
      background-color="var(--color-gray-100)"
    >
      <PText class="font-semibold">Gray burst</PText>
    </PRadialBurst>
  </PStack>
</template>
```

## Custom size

Use `size` to control the diameter of the rotating ray layer. When omitted, it defaults to `150%` of the container width.

```vue demo
<template>
  <PStack align="center" gap="8">
    <PRadialBurst class="h-80 w-80" size="175%">
      <PText class="text-sm">size="175%"</PText>
    </PRadialBurst>

    <PRadialBurst class="h-80 w-80" size="200%">
      <PText class="text-sm">size="200%"</PText>
    </PRadialBurst>
  </PStack>
</template>
```

## Slot content

Place any content in the default slot. It stays centered above the animated background.

```vue demo
<template>
  <PRadialBurst class="h-100">
    <PStack direction="vertical" align="center" gap="4">
      <PBadge variant="green">New</PBadge>
      <PText class="text-center font-semibold">Something exciting is here</PText>
      <PButton size="sm">Learn more</PButton>
    </PStack>
  </PRadialBurst>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `string \| number` | - | Diameter of the rotating ray layer. Falls back to `150%` of the container when omitted. |
| primary-color | `string` | `var(--color-yellow-400)` | Color of the radial rays. |
| background-color | `string` | `var(--color-yellow-300)` | Background fill behind the rays. |

## Slots

| Name | Description |
| --- | --- |
| default | Centered content rendered above the burst background. |
