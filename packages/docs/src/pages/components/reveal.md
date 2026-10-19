# Reveal

Fade an element in while it moves from an offset and optional blur into place. By default the animation runs on mount with no JavaScript observer involved; set `trigger` to `viewport` to hold it back until the element scrolls into view.

## Default

```vue demo
<template>
  <PReveal>
    <PCard class="w-80">
      <div class="font-medium">Content that fades in</div>
      <div class="text-13px text-gray-600">No observer is created in this mode.</div>
    </PCard>
  </PReveal>
</template>
```

## Direction

`direction` sets the edge the element travels from, so `bottom` means it starts below its resting place and settles upward.

```vue demo
<template>
  <PStack direction="vertical" :gap="4">
    <PReveal direction="top">
      <PCard>From the top</PCard>
    </PReveal>
    <PReveal direction="bottom">
      <PCard>From the bottom</PCard>
    </PReveal>
    <PReveal direction="left">
      <PCard>From the left</PCard>
    </PReveal>
    <PReveal direction="right">
      <PCard>From the right</PCard>
    </PReveal>
  </PStack>
</template>
```

## Duration and Delay

A bare number is read as seconds; pass a string to carry your own unit. `delay` staggers a list — give each item its own value.

```vue demo
<script setup>
const items = ['First', 'Second', 'Third']
</script>

<template>
  <PStack direction="vertical" :gap="4">
    <PReveal :duration="1" :delay="0">
      <PCard>Plays over one second</PCard>
    </PReveal>
    <PReveal duration="800ms" :delay="0.3">
      <PCard>Waits 300ms, then plays</PCard>
    </PReveal>
    <PReveal :delay="0.6">
      <PCard>Waits 600ms</PCard>
    </PReveal>
  </PStack>
</template>
```

## Distance

`distance` is the initial offset in pixels.

```vue demo
<template>
  <PStack direction="vertical" :gap="4">
    <PReveal :distance="0">
      <PCard>Fades in place</PCard>
    </PReveal>
    <PReveal :distance="48">
      <PCard>Travellers further</PCard>
    </PReveal>
  </PStack>
</template>
```

## On Viewport

`trigger="viewport"` holds the element at its first frame until it enters the viewport. `rootMargin` decides how early that happens, which is what staggers a long list as it scrolls past. The reveal is one-shot: once played, the element stops being observed and never replays. Where `IntersectionObserver` is unavailable, the element is left visible instead of waiting for a callback that can never arrive.

```vue demo
<template>
  <div class="h-200 overflow-scroll rounded-lg border border-dashed">
    <div class="flex h-150 flex-col justify-between">
      <PReveal trigger="viewport" root-margin="0px 0px -20% 0px">
        <PCard>Plays once this card reaches the viewport</PCard>
      </PReveal>
      <PReveal trigger="viewport" root-margin="0px 0px -20% 0px">
        <PCard>Each element plays on its own</PCard>
      </PReveal>
      <PReveal trigger="viewport" root-margin="0px 0px -20% 0px">
        <PCard>And never replays</PCard>
      </PReveal>
    </div>
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| duration | `number \| string` | `0.5` | Animation duration. A bare number is seconds; a string passes its unit through. |
| delay | `number \| string` | `0` | Delay before the animation starts, in the same form as `duration`. |
| distance | `number \| string` | `16` | Initial offset in pixels along the reveal axis. |
| direction | `'top' \| 'bottom' \| 'left' \| 'right'` | `bottom` | Edge the element travels from. |
| trigger | `'mount' \| 'viewport'` | `mount` | `mount` plays on render without creating an observer; `viewport` waits for the element to enter the viewport. |
| root | `Element \| Document \| null` | - | Scrolling ancestor to observe against, `null` for the viewport. |
| rootMargin | `string` | `0px` | Margin applied to `root`, which decides how early the animation starts. |
| threshold | `number \| number[]` | `0` | Intersection ratio at which the element counts as visible. |

## Slots

| Name | Description |
| --- | --- |
| default | Content to reveal. |
