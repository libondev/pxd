# Link Button

Inherit button style links.

## Default

LinkButton extends the [Button component](/components/button).

```vue demo
<template>
  <PStack>
    <PLinkButton href="javascript:;" text="text prop button" />
    <PLinkButton href="javascript:;"> slot button </PLinkButton>
  </PStack>
</template>
```

## Text Link

Set `variant="text"` to convert it into a link in normal text form.

```vue demo
<template>
  <PStack>
    <PLinkButton href="javascript:;" text="text prop button" variant="link" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| href | `string` | - | Paths starting with `/` or `#` render as `router-link`, others as `a` |
| text | `string` | - | Text rendered when the default slot is empty |
| align | `'left' \| 'center' \| 'right'` | `left` | Horizontal alignment of the button content |
| target | `'_blank' \| '_self' \| '_parent' \| '_top'` | `_self` | Browsing context of the link, e.g. `_blank` opens a new tab |
| external-icon | `boolean` | - | Show an external link icon in the suffix |

## Events

| Name | Type | Description |
| --- | --- | --- |
| click | `(event: MouseEvent) => void` | Emitted when the link is clicked. |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
