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

function onSelect(item, ev) {
  console.log(item, ev)
}
</script>

<template>
  <PStack>
    <PMenu width="200" :options="options" @select="onSelect">
      <PButton variant="primary">Actions</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu width="200" @select="onSelect">
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

## Checked

Before enabling this feature, you must ensure that the `value` attribute is set for each list-item.

```vue demo
<script setup>
import { ref } from 'vue'

const checkedValue = ref('')

const options = [
  { label: 'One', value: 'One', },
  { label: 'Two', value: 'two', },
  { label: 'Three', value: 'three', disabled: true },
  { label: 'Four', value: 'four', type: 'warning' },
  { label: 'Delete', value: 'five', type: 'error' },
]
</script>

<template>
  <PStack>
    <PMenu v-model="checkedValue" :options="options" width="200">
      <PButton>{{ checkedValue || 'Actions' }}</PButton>
    </PMenu>

    <!-- Custom rendering menu-items -->
    <PMenu v-model="checkedValue" width="200">
      <PButton>{{ checkedValue || 'Actions' }}</PButton>

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
  <PMenu :options="options" position="right-start" width="200">
    <PButton variant="primary">Actions</PButton>
  </PMenu>
</template>
```
