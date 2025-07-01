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

    <!-- Custom rendering menu-items -->
    <PMenu :options="options">
      <PButton variant="primary">Actions</PButton>

      <template #items>
        <PMenuItem v-for="(item, index) of options" v-bind="item">
          {{ index }} - {{ item.label }}
        </PMenuItem>
      </template>
    </PMenu>
  </PStack>
</template>
```

## Disabled items

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

## Link items

```vue demo
<script setup>
const options = [
  { as: 'RouterLink', to: '#', label: 'One' },
  { as: 'RouterLink', to: '#', label: 'Two' },
  { as: 'RouterLink', to: '#', label: 'Three', disabled: true },
  { as: 'RouterLink', to: '#', label: 'Delete', type: 'error' },
]
</script>

<template>
  <PMenu :options="options" menu-width="200px">
    <PButton variant="primary">Actions</PButton>
  </PMenu>
</template>
```

## Menu position

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
  <PMenu :options="options" position="right-start" menu-width="200px">
    <PButton variant="primary">Actions</PButton>
  </PMenu>
</template>
```
