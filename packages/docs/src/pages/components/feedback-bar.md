# Feedback Bar

Quick feedback bar.

## Default

```vue demo
<template>
  <PFeedbackBar label="Is this response helpful?" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | - | Prompt text shown next to the info icon |

## Events

| Name | Type | Description |
| --- | --- | --- |
| close | `() => void` | Emitted when the close button is clicked. |
| thumbUp | `() => void` | Emitted when the thumb-up button is clicked. |
| thumbDown | `() => void` | Emitted when the thumb-down button is clicked. |
