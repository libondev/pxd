# Backtop

A button to back to top.

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
| append-to-body | `boolean` | `true` | - |
| visible-threshold | `number` | `30` | - |
| scroll-target | `'top' \| 'bottom'` | `top` | - |
| scroll-behavior | `'smooth' \| 'instant'` | `smooth` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
