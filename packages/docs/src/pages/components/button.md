# Button

One of the most basic components, it will help you complete the interaction.

## Sizes

```vue demo
<template>
  <PStack align="center">
    <PButton size="sm">Small</PButton>
    <PButton size="md">Medium</PButton>
    <PButton size="lg">Large</PButton>
  </PStack>
</template>
```

## Shape

```vue demo
<template>
  <PStack>
    <PButton shape="default"> click me </PButton>
    <PButton shape="rounded"> click me </PButton>
    <PButton shape="square"> click me </PButton>
  </PStack>
</template>
```

## Variants

```vue demo
<template>
  <PStack>
    <PButton variant="default">default</PButton>
    <PButton variant="primary">primary</PButton>
    <PButton variant="success">success</PButton>
    <PButton variant="error">error</PButton>
    <PButton variant="ghost">ghost</PButton>
  </PStack>
</template>
```

## Disabled/Loading

```vue demo
<template>
  <PStack>
    <PButton disabled>disabled</PButton>
    <PButton loading>loading</PButton>

    <PButton variant="primary" disabled>disabled</PButton>
    <PButton variant="ghost" loading>loading</PButton>
  </PStack>
</template>
```

## Icon

```vue demo
<script setup>
import HeartIcon from '@gdsicon/vue/heart-fill'
</script>

<template>
  <PStack>
    <PButton icon><HeartIcon /></PButton>
    <PButton icon variant="primary"><HeartIcon /></PButton>
    <PButton icon variant="success"><HeartIcon /></PButton>
    <PButton icon variant="error"><HeartIcon /></PButton>
    <PButton icon variant="ghost"><HeartIcon /></PButton>
  </PStack>
</template>
```

## Full width

Set the `full-width` property to make the button exclusive to one line.

```vue demo
<template>
  <PButton full-width>Block Button </PButton>
</template>
```

## Group

```vue demo
<script setup>
import ChevronDownIcon from '@gdsicon/vue/chevron-down'
</script>

<template>
  <PStack direction="vertical">
    <PButtonGroup>
      <PButton>Previous Page</PButton>
      <PButton>Next Page</PButton>
    </PButtonGroup>

    <PButtonGroup variant="primary">
      <PButton>Previous Page</PButton>
      <PButton>Next Page</PButton>
    </PButtonGroup>

    <PButtonGroup size="sm" disabled align="left" class="w-md">
      <PButton full-width>Previous Page</PButton>
      <PButton full-width>Next Page</PButton>
    </PButtonGroup>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `button` | - |
| variant | `'default' \| 'primary' \| 'error' \| 'warning' \| 'success' \| 'ghost' \| 'simple' \| 'link'` | - | - |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | - |
| shape | `'default' \| 'square' \| 'rounded'` | - | - |
| align | `'left' \| 'center' \| 'right'` | - | - |
| icon | `boolean` | `false` | - |
| loading | `boolean` | - | - |
| disabled | `boolean` | - | - |
| full-width | `boolean` | - | - |

## ButtonGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | - |
| align | `'left' \| 'center' \| 'right'` | - | - |
| variant | `ButtonVariant` | - | - |
| disabled | `boolean` | - | - |
