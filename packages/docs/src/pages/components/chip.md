# Chip

An indicator of a numeric value or a state.

## Default

```vue demo
<script setup>
import InboxIcon from '@gdsicon/vue/inbox'
</script>

<template>
  <PStack>
    <PChip variant="primary">
      <PButton icon-only></PButton>
    </PChip>
    <PChip variant="success">
      <PButton icon-only></PButton>
    </PChip>
    <PChip variant="warning">
      <PButton icon-only></PButton>
    </PChip>
    <PChip variant="error">
      <PButton icon-only></PButton>
    </PChip>
    <PChip variant="secondary">
      <PButton icon-only></PButton>
    </PChip>
  </PStack>
</template>
```

## Size

```vue demo
<template>
  <PChip dimension="15">
    <PButton icon-only />
  </PChip>
</template>
```

## Text

```vue demo
<script setup>
import InboxIcon from '@gdsicon/vue/inbox'
</script>

<template>
  <PChip label="99+" variant="error">
    <PButton icon-only>
      <InboxIcon />
    </PButton>
  </PChip>
</template>
```

## Inset

Use the inset prop to display the Chip inside the component. This is useful when dealing with rounded components.

```vue demo
<template>
  <PChip variant="success" inset>
    <PAvatar src="https://avatars.githubusercontent.com/u/47918504?v=4" />
  </PChip>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| dimension | `number \| string` | - | Diameter of the dot shown when no `label` is set |
| inset | `boolean` | - | Display the chip inside the wrapped component |
| label | `string \| number \| null` | - | Text rendered inside the chip, such as `99+` |
| variant | `'primary' \| 'error' \| 'warning' \| 'success' \| 'secondary'` | `primary` | Chip color |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
