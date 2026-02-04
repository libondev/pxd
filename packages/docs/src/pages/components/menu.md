# Menu

Dropdown menu opened via button. Supports typeahead and keyboard navigation.

## Default

```vue demo
<script setup>
const options = [
  { label: 'One' },
  { label: 'Two' },
  { label: 'Three', disabled: true },
  { label: 'Remove', type: 'warning' },
  { label: 'Delete', type: 'error' },
]

function onSelect(ev, item) {
  console.log(ev, item)
}
</script>

<template>
  <PStack>
    <PMenu :options="options" @select="onSelect">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu @select="onSelect">
      <PButton variant="primary">Actions</PButton>

      <template #items>
        <PListItem v-for="(item, index) of options" :key="item.label" v-bind="item">
          {{ index }} - {{ item.label }}
        </PListItem>
      </template>
    </PMenu>
  </PStack>
</template>
```

## Link items

```vue demo
<script setup>
const options = [
  { as: 'RouterLink', to: 'menu', label: 'One' },
  { as: 'RouterLink', to: 'menu', label: 'Two' },
  { as: 'RouterLink', to: 'menu', label: 'Three', disabled: true },
  { as: 'RouterLink', to: 'menu', label: 'Four', type: 'warning' },
  { as: 'RouterLink', to: 'menu', label: 'Delete', type: 'error' },
]
</script>

<template>
  <PStack>
    <PMenu :options="options" width="200">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu width="200">
      <PButton variant="primary">Actions</PButton>

      <template #items>
        <PListItem v-for="(item, index) of options" :key="item.label" v-bind="item">
          {{ index }} - {{ item.label }}
        </PListItem>
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
  { label: 'One' },
  { label: 'Two' },
  { label: 'Three', disabled: true },
  { label: 'Delete', type: 'error' },
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
  { label: 'One' },
  { label: 'Two' },
  { label: 'Three', disabled: true },
  { label: 'Delete', type: 'error' },
]
</script>

<template>
  <PStack>
    <PMenu :options="options" position="right-start" width="200">
      <PButton variant="primary">Actions</PButton>
    </PMenu>
  </PStack>
</template>
```
