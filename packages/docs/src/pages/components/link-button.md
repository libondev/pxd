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
| href | `string` | - | - |
| text | `string` | - | - |
| align | `'left' \| 'center' \| 'right'` | `left` | - |
| target | `'_blank' \| '_self' \| '_parent' \| '_top'` | `_self` | - |
| external-icon | `boolean` | - | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
