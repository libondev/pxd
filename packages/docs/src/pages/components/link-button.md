# Link Button

Inherit button style links.

## Default

LinkButton extends the [Button component](/components/button).

```vue demo
<template>
  <PStack>
    <PLinkButton href="javascript:;">button</PLinkButton>
    <PLinkButton href="javascript:;"> slot button </PLinkButton>
  </PStack>
</template>
```

## Text Link

Set `variant="link"` to convert it into a link in normal text form.

```vue demo
<template>
  <PStack>
    <PLinkButton href="javascript:;" variant="link">link button</PLinkButton>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| href | `string` | - | Paths starting with `/` or `#` render as `router-link` when the host registers one, otherwise as `a`; an empty value renders a plain `button` |
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
