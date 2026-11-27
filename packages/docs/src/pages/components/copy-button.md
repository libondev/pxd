# Copy Button

A button that copies a given string to the clipboard and provides feedback when copied.

## Default

CopyButton extends the [Button component](/components/button).

```vue demo
<template>
  <PCopyButton content="lorem" />
</template>
```

## Variant

```vue demo
<template>
  <PStack>
    <PCopyButton content="lorem" variant="default" />
    <PCopyButton content="lorem" variant="primary" />
    <PCopyButton content="lorem" variant="success" />
    <PCopyButton content="lorem" variant="warning" />
    <PCopyButton content="lorem" variant="error" />
    <PCopyButton content="lorem" variant="ghost" />
  </PStack>
</template>
```

## With label

```vue demo
<template>
  <PCopyButton content="lorem" variant="default">
    <template #prefix>
      <span>Click to copy</span>
    </template>
  </PCopyButton>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| content | `ComponentText \| ((event: PointerEvent) => ComponentText)` | - | Text to copy, or a function that receives the click event |

## Events

| Name | Type | Description |
| --- | --- | --- |
| copy | `(content: string, event: PointerEvent) => void` | Emitted after the text has been copied to the clipboard. |
| error | `(error: unknown, event: PointerEvent) => void` | Emitted when copying fails after both the Clipboard API and the fallback failed. |

## Slots

| Name | Description |
| --- | --- |
| prefix | Content before the copy icon, scoped with `{ copied }` |
| suffix | Content after the copy icon, scoped with `{ copied }` |
