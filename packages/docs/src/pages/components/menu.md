# Menu
Dropdown menu opened via button. Supports typeahead and keyboard navigation.

## Default

```vue demo
<script setup>
const options = [
  { label: 'One' },
  { label: 'Two' },
  { label: 'Three', disabled: true },
  { label: 'Delete', type: 'error' },
]
</script>

<template>
  <PStack>
    <PMenu :options="options">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <PMenu :options="options">
      <PButton variant="primary">Actions</PButton>

      <template #items>
        <PMenuItem v-for="item of options" v-bind="item" />
      </template>
    </PMenu>
  </PStack>
</template>
```

## Disabled Items

```vue demo
<script setup>
const options = [
  { label: 'One', onClick: () => undefined },
  { label: 'Two', onClick: () => undefined },
  { label: 'Three', disabled: true },
  { label: 'Delete', type: 'error' },
]
</script>

<template>
  <PMenu :options="options" menu-width="200px">
    <PButton variant="primary">Actions</PButton>
  </PMenu>
</template>
```
