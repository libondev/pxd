# Chip
An indicator of a numeric value or a state.

## Default

```vue demo
<script setup>
import InboxIcon from '@gdsicon/vue/inbox'
</script>

<template>
  <PStack gap="5">
    <PChip variant="primary">
      <PButton icon></PButton>
    </PChip>
    <PChip variant="success">
      <PButton icon></PButton>
    </PChip>
    <PChip variant="warning">
      <PButton icon></PButton>
    </PChip>
    <PChip variant="error">
      <PButton icon></PButton>
    </PChip>
    <PChip variant="secondary">
      <PButton icon></PButton>
    </PChip>
  </PStack>
</template>
```

## Size

```vue demo
<template>
  <PChip size="15">
    <PButton icon />
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
    <PButton icon>
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
