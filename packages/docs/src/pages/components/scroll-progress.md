# Scroll Progress

Track the scroll position of a container and display it as a percentage.

## Default

```vue demo
<template>
  <PText>Scroll the container to see the percentage update.</PText>

  <div id="scroll-progress-demo" class="h-40 mt-2 overflow-y-auto border rounded-lg border-dashed">
    <div class="h-72 p-4">
      <PText>Keep scrolling...</PText>
    </div>
  </div>

  <PScrollProgress class="mt-2" scroll-target="#scroll-progress-demo" />
</template>
```

## Page scroll

Without `scroll-target`, the component tracks the page itself.

```vue demo
<template>
  <PScrollProgress />
</template>
```

## Custom content

The default slot replaces the rendered text and receives the current `percentage`.

```vue demo
<template>
  <PScrollProgress scroll-target="#scroll-progress-custom">
    <template #default="{ percentage }">You have read {{ percentage }}%</template>
  </PScrollProgress>

  <div
    id="scroll-progress-custom"
    class="h-40 mt-2 overflow-y-auto border rounded-lg border-dashed"
  >
    <div class="h-72 p-4">
      <PText>Keep scrolling...</PText>
    </div>
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| scroll-target | `string \| HTMLElement \| ComponentPublicInstance \| null` | `null` | Scrollable container to observe: a CSS selector, an element, or a component instance; falls back to the page viewport |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(percentage: number) => void` | Emitted when the displayed percentage changes. |

## Slots

| Name | Description |
| --- | --- |
| default | Custom content. Slot props: `percentage`. |
