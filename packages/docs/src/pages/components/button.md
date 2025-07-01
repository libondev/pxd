# Button
One of the most basic components, it will help you complete the interaction.

## Sizes

```vue demo
<template>
  <PStack>
    <PButton size="sm">sm</PButton>
    <PButton>md(default)</PButton>
    <PButton size="lg">lg</PButton>
  </PStack>
</template>
```

## Types

```vue demo
<template>
  <PStack>
    <PButton>default</PButton>
    <PButton variant="ghost">ghost</PButton>
    <PButton variant="error">error</PButton>
    <PButton variant="primary">primary</PButton>
    <PButton variant="success">success</PButton>
    <PButton disabled>disabled</PButton>
    <PButton loading>loading</PButton>
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
    <PButton icon variant="ghost"><HeartIcon /></PButton>
    <PButton icon variant="error"><HeartIcon /></PButton>
    <PButton icon variant="primary"><HeartIcon /></PButton>
    <PButton icon variant="success"><HeartIcon /></PButton>
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

## Block
Set the `block` property to make the button exclusive to one line.

```vue demo
<template>
  <PButton block>Block Button </PButton>
</template>
```
