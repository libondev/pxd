# Button
One of the most basic components, it will help you complete the interaction.

## Sizes

```vue demo
<template>
  <PStack align="center">
    <PButton size="sm">Small</PButton>
    <PButton>Medium</PButton>
    <PButton size="lg">Large</PButton>
  </PStack>
</template>
```

## Shape

```vue demo
<template>
  <PStack>
    <PButton> click me </PButton>
    <PButton shape="rounded"> click me </PButton>
    <PButton shape="square"> click me </PButton>
  </PStack>
</template>
```

## Variants

```vue demo
<template>
  <PStack>
    <PButton>default</PButton>
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

## Shape

```vue demo
<template>
  <PStack>
    <PButton>default</PButton>
    <PButton shape="square">square</PButton>
    <PButton shape="rounded">rounded</PButton>
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
