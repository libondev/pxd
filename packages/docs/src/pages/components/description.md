# Description

Displays a brief heading and subheading to communicate any additional information or context a user needs to continue.

## Default

```vue demo
<template>
  <PDescription
    heading="Section Title"
    tooltip="Additional context about what this section refers to."
    description="Data about this section."
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| heading | `string` | - | Heading text, overridable by the `heading` slot |
| tooltip | `string` | - | Content of the info tooltip next to the heading |
| description | `string` | - | Body text, overridable by the `description` slot |

## Slots

| Name | Description |
| --- | --- |
| description | Description slot |
| heading | Heading slot |
