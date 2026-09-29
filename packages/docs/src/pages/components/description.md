# Description

Displays a brief heading and subheading to communicate any additional information or context a user needs to continue.

## Default

```vue demo
<template>
  <PDescription
    title="Section Title"
    tooltip="Additional context about what this section refers to."
    description="Data about this section."
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| title | `string` | - | Heading text, overridable by the `title` slot |
| tooltip | `string` | - | Content of the info tooltip next to the title |
| description | `string` | - | Body text, overridable by the `description` slot |

## Slots

| Name | Description |
| --- | --- |
| description | Description slot |
| title | Title slot |
