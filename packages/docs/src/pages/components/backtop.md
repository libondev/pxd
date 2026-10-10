# Backtop

A back-to-top button that appears once the page or its container scrolls past a threshold.

## Default

```vue demo
<template>
  <PText>Scroll down to see the bottom-right button.</PText>

  <PBacktop class="right-6 bottom-6" />
</template>
```

## Inside the container

```vue demo
<template>
  <PText>Scroll down to see the bottom-right button.</PText>

  <div class="relative mt-2 h-40 overflow-y-auto border rounded-lg border-dashed">
    <div class="h-60 bg-background-100"></div>

    <PBacktop class="left-1/2 -translate-x-1/2 bottom-0 z-1" :append-to-body="false" />
  </div>
</template>
```

## Customizations

```vue demo
<template>
  <PText>Scroll down to see the bottom-right button.</PText>

  <PBacktop class="right-6 bottom-16" :visible-threshold="15">
    <PButton variant="primary">Back to top</PButton>
  </PBacktop>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| append-to-body | `boolean` | `true` | Render into `body` as `fixed`, or in place as `absolute` when `false` |
| visible-threshold | `number` | `30` | Distance in `px` from the target edge before it shows |
| size | `'sm' \| 'md' \| 'lg'` | - | Size of the built-in trigger button, overridable by the default slot |
| scroll-target | `'top' \| 'bottom'` | `top` | Scroll to the `top` or `bottom` on click |
| scroll-behavior | `'smooth' \| 'instant' \| 'auto'` | `auto` | Scroll animation on click; `auto` follows the system motion preference. |

## Events

| Name | Type | Description |
| --- | --- | --- |
| click | `(event: PointerEvent) => void` | Emitted when the back-to-top button is clicked. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
