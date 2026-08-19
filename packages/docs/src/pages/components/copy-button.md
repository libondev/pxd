# Copy Button

A button that copies a given string to the clipboard and provides feedback when copied.

## Default

CopyButton extends the [Button component](/components/button).

```vue demo
<template>
  <PCopyButton text="lorem" icon />
</template>
```

## Variant

```vue demo
<template>
  <PStack>
    <PCopyButton icon text="lorem" variant="default" />
    <PCopyButton icon text="lorem" variant="primary" />
    <PCopyButton icon text="lorem" variant="success" />
    <PCopyButton icon text="lorem" variant="warning" />
    <PCopyButton icon text="lorem" variant="error" />
    <PCopyButton icon text="lorem" variant="ghost" />
  </PStack>
</template>
```

## With label

```vue demo
<template>
  <PCopyButton text="lorem" variant="default">
    <span>
      Click to copy
    </span>
  </PCopyButton>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| text | `string \| null` | - | Text to copy to the clipboard |

## Events

| Name | Parameters | Description |
| --- | --- | --- |
| copy | `(text: string \| null \| undefined, event: PointerEvent)` | Emitted when the copy action is triggered |
