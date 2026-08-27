# Dots Spinner

Braille-style spinner that cycles through dot-matrix characters to indicate a running process.

## Default

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
    <PSpinnerDots />
    <PSpinnerDots class="text-xl" />
  </PStack>
</template>
```

## Variant

Use `variant` to pick a built-in braille frame preset (`dots0` – `dots9`).

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
    <PSpinnerDots variant="dots0" />
    <PSpinnerDots variant="dots1" />
    <PSpinnerDots variant="dots2" />
    <PSpinnerDots variant="dots3" />
    <PSpinnerDots variant="dots4" />
    <PSpinnerDots variant="dots5" />
    <PSpinnerDots variant="dots6" />
    <PSpinnerDots variant="dots7" />
    <PSpinnerDots variant="dots8" />
    <PSpinnerDots variant="dots9" />
  </PStack>
</template>
```

## Custom Frames

Pass a string array to `data` to cycle through custom characters. When `data` is a non-empty array, it takes precedence over `variant`.

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
    <PSpinnerDots :data="['🕛', '🕐', '🕑', '🕒', '🕓', '🕔', '🕕', '🕖', '🕗', '🕘', '🕙', '🕚']" />
    <PSpinnerDots :data="['🤘', '🤟', '🖖', '✋', '🤚', '👆']" />
  </PStack>
</template>
```

## Interval

Use `interval` to control how long each frame stays visible, in milliseconds. The total cycle is `frames × interval`.

```vue demo
<template>
  <PStack direction="vertical" :gap="2">
    <PSpinnerDots :interval="50" />
    <PSpinnerDots :interval="300" />
  </PStack>
</template>
```

## Accessibility

The animated frames are marked `aria-hidden` so screen readers will not announce the full character sequence. The component is purely decorative; wrap it with a label when it conveys state.

```vue demo
<template>
  <PStack align="center" :gap="2">
    <PSpinnerDots />
    <PText secondary>Loading…</PText>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `'dots0' \| 'dots1' \| 'dots2' \| 'dots3' \| 'dots4' \| 'dots5' \| 'dots6' \| 'dots7' \| 'dots8' \| 'dots9'` | `'dots0'` | Built-in braille frame preset. Ignored when `data` is a non-empty array. |
| interval | `number` | `100` | How long each frame stays visible, in milliseconds. |
| data | `string[]` | - | Custom frame characters. Takes precedence over `variant` when non-empty. |
