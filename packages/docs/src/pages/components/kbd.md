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
| alt | `boolean` | - | Render the `⌥` symbol for the Option key |
| ctrl | `boolean` | - | Render the `Ctrl` text for the Control key |
| meta | `boolean` | - | Render the `⌘` symbol for the Command key |
| enter | `boolean` | - | Render the `↵` symbol for the Enter key |
| shift | `boolean` | - | Render the `⇧` symbol for the Shift key |
| label | `string \| number \| null` | - | Content rendered after the key symbols |
| size | `'sm' \| 'md' \| 'lg'` | - | Key size, falls back to the global config provider size |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
