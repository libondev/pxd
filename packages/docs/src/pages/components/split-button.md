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
  <PSplitButton :options="options">
    Execute
  </PSplitButton>
</template>
```

## Icon

```vue demo
<script setup>
import SettingsGearIcon from '@gdsicon/vue/settings-gear'

const options = [
  { label: 'One', value: 'One' },
  { label: 'Two', value: 'Two' },
  { label: 'Three', value: 'Three', disabled: true },
  { label: 'Remove', value: 'Remove', variant: 'warning' },
  { label: 'Delete', value: 'Delete', variant: 'error' },
]
</script>

<template>
  <PSplitButton :options="options">
    Execute

    <template #icon>
      <SettingsGearIcon />
    </template>
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
</script>

<template>
  <PSplitButton v-model="checkedValue" :options="options">
    <template #default="{ data }">
      {{ data?.label || 'Actions' }}
    </template>

    <template #item="{ item }">
      {{ item.label }}
    </template>
  </PSplitButton>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| variant | `ButtonVariant` | - | Colour scheme shared by both buttons, e.g. `primary` or `ghost` |
| size | `'xs' \| 'sm' \| 'md' \| 'lg'` | - | Size of both buttons, falling back to the config provider size |
| shape | `'default' \| 'square' \| 'rounded'` | - | Corner radius of both buttons: `default`, `square` or `rounded` |
| options | `ListOption[]` | - | Menu items, each needing a `value` for the checked state |
| disabled | `boolean` | - | Disable the primary button and the dropdown trigger |
| model-value | `ListOptionSelected['value']` | - | Value of the selected option, exposed to the default slot as `data` |
| close-on-press-escape | `boolean` | - | Close the dropdown when pressing `Escape` |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot: `{ data }` |
| icon | Custom dropdown icon |
| item | Custom menu item content: `{ item, index }` |
