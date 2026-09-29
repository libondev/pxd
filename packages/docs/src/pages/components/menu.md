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
    <PMenu :options="options" @change="onChange">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu :options="options" @change="onChange">
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
    <PMenu :options="options">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu :options="options">
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
  <PMenu :options="options" position="right-start">
    <PButton variant="primary">Actions</PButton>
  </PMenu>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| options | `ListOption[]` | `() => []` | Items to render, each may be a single option or a group |
| disabled | `boolean` | - | Disable the trigger so the menu cannot be opened |
| position | `'top' \| 'right' \| 'bottom' \| 'left' \| ...` | `bottom-start` | Placement of the menu relative to the trigger |
| model-value | `ListOptionSelected['value'] \| ListOptionSelected['value'][]` | - | Selected value, an array when `multiple` is set |
| multiple | `boolean` | - | Keep the menu open and let several options be selected |
| virtual | `boolean` | `false` | Enable virtualized rendering for large option sets |
| close-on-press-escape | `boolean` | `true` | Close the menu when the `Escape` key is pressed |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
| item | Custom item content: `{ item, index }` |
