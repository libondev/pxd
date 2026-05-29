# Kbd

Display keyboard input that triggers an action.

## Modifiers

```vue demo
<template>
  <PStack gap="2">
    <PKbd meta />
    <PKbd shift />
    <PKbd alt />
    <PKbd ctrl />
  </PStack>
</template>
```

## Combination

```vue demo
<template>
  <PKbd meta shift />
</template>
```

## Sizes

```vue demo
<template>
  <PStack align="center" gap="2">
    <PKbd size="sm">P</PKbd>
    <PKbd size="md">P</PKbd>
    <PKbd size="lg">P</PKbd>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| alt | `boolean` | - | - |
| ctrl | `boolean` | - | - |
| meta | `boolean` | - | - |
| enter | `boolean` | - | - |
| shift | `boolean` | - | - |
| label | `string \| number \| null` | - | - |
| size | `'sm' \| 'md' \| 'lg'` | - | - |
