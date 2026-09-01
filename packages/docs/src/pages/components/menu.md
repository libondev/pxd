# Menu

Dropdown menu opened via button. Supports typeahead and keyboard navigation.

## Default

```vue demo
<script setup>
const options = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three', disabled: true },
  { label: 'Remove', value: 'remove', variant: 'warning' },
  { label: 'Delete', value: 'delete', variant: 'error' },
]

function onChange(item) {
  console.log(item)
}
</script>

<template>
  <PStack>
    <PMenu width="200" :options="options" @change="onChange">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu width="200" :options="options" @change="onChange">
      <PButton variant="primary">Actions</PButton>

      <template #item="{ item }">
        {{ item.label }} - {{ item.value }}
      </template>
    </PMenu>
  </PStack>
</template>
```

## Link items

```vue demo
<script setup>
const options = [
  { as: 'RouterLink', to: 'menu', label: 'One', value: 'one' },
  { as: 'RouterLink', to: 'menu', label: 'Two', value: 'two' },
  { as: 'RouterLink', to: 'menu', label: 'Three', value: 'three', disabled: true },
  { as: 'RouterLink', to: 'menu', label: 'Four', value: 'four', variant: 'warning' },
  { as: 'RouterLink', to: 'menu', label: 'Delete', value: 'delete', variant: 'error' },
]
</script>

<template>
  <PStack>
    <PMenu :options="options" width="200">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu width="200" :options="options">
      <PButton variant="primary">Actions</PButton>

      <template #item="{ item }">
        {{ item.label }}
      </template>
    </PMenu>
  </PStack>
</template>
```

## Without closeOnPressEscape

Pressing esc after setting will not close.

```vue demo
<script setup>
const options = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three', disabled: true },
  { label: 'Delete', value: 'delete', variant: 'error' },
]
</script>

<template>
  <PMenu :options="options" :close-on-press-escape="false">
    <PButton variant="primary">Actions</PButton>
  </PMenu>
</template>
```

## Menu position

```vue demo
<script setup>
const options = [
  { label: 'One', value: 'one' },
  { label: 'Two', value: 'two' },
  { label: 'Three', value: 'three', disabled: true },
  { label: 'Delete', value: 'delete', variant: 'error' },
]
</script>

<template>
  <PMenu :options="options" position="right-start" width="200">
    <PButton variant="primary">Actions</PButton>
  </PMenu>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| options | `ListOption[]` | `() => []` | - |
| disabled | `boolean` | - | - |
| position | `'top' \| 'right' \| 'bottom' \| 'left' \| ...` | `bottom-start` | - |
| model-value | `ListOptionSelected['value']` | - | - |
| close-on-press-escape | `boolean` | `true` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
| item | Custom item content: `{ item, index }` |
