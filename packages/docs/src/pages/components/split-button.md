# Split Button

A button that offers a primary interaction coupled with a dropdown menu offering additional actions.

## Default

SplitButton extends the [Button component](/components/button) and [Menu component](/components/menu).

```vue demo
<script setup>
const options = [
  { label: 'One', value: 'One' },
  { label: 'Two', value: 'Two' },
  { label: 'Three', value: 'Three', disabled: true },
  { label: 'Remove', value: 'Remove', variant: 'warning' },
  { label: 'Delete', value: 'Delete', variant: 'error' },
]
</script>

<template>
  <PSplitButton :options="options" list-width="200">
    Execute
  </PSplitButton>
</template>
```

## Checked

Before enabling this feature, you must ensure that the `value` attribute is set for each list-item.

```vue demo
<script setup>
import { ref } from 'vue'

const checkedValue = ref('')

const options = [
  { label: 'One', value: 'one', },
  { label: 'Two', value: 'two', },
  { label: 'Three', value: 'three', disabled: true },
  { label: 'Four', value: 'four', variant: 'warning' },
  { label: 'Delete', value: 'five', variant: 'error' },
]

function onChange(item) {
  if (item.value === checkedValue.value) {
    checkedValue.value = ''
  } else {
    checkedValue.value = item.value
  }
}
</script>

<template>
  <PStack>
    <PSplitButton :model-value="checkedValue" :options="options" width="200" @select="onChange">
      <template #default="{ data }">
        {{ data?.label || 'Actions' }}
      </template>
    </PSplitButton>

    <!-- Custom rendering menu-items -->
    <PSplitButton v-model="checkedValue" width="200">
      <template #default="{ data }">
        {{ data?.label || 'Actions' }}
      </template>

      <template #items>
        <PListItem v-for="(item, index) of options" :key="item.label" v-bind="item">
          {{ index }} - {{ item.label }}
        </PListItem>
      </template>
    </PSplitButton>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `ButtonVariant` | - | - |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | - |
| shape | `'default' \| 'square' \| 'rounded'` | - | - |
| options | `ListOption[]` | - | - |
| disabled | `boolean` | - | - |
| list-width | `string \| number` | - | - |
| model-value | `ListOptionSelected['value']` | - | - |
| close-on-press-escape | `boolean` | - | - |
