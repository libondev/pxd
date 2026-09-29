# Select

Displays a list of options for the user to pick from—triggered by a button.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]
</script>

<template>
  <PSelect v-model="value" class="w-full" :options="options" placeholder="Please select"></PSelect>
</template>
```

## Multiple

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([1, 2])

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]
</script>

<template>
  <PSelect v-model="value" class="w-full" :options="options" multiple />
</template>
```

## Label format

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([1, 2, 3])

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]

function labelFormatter(valueList) {
  return valueList.map(i => i.label).join(' & ')
}
</script>

<template>
  <PSelect v-model="value" class="w-full" :options="options" multiple :label-format="labelFormatter" />
</template>
```

## Custom

```vue demo
<script setup>
import { ref } from 'vue'
import ChevronDownIcon from '@gdsicon/vue/chevron-down'

const value = ref('')

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]
</script>

<template>
  <PSelect v-model="value" class="w-full" :suffix-icon="false" :options="options" placeholder="Please select">
    <template #prefix>
      <span class="inline-flex ms-1.5 size-2 bg-gray-500 rounded-full" :class="{ 'bg-primary': value }"></span>
    </template>

    <template #default="{ label }">
      {{ label }} - {{ value }}
    </template>
  </PSelect>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `string \| number \| (string \| number)[] \| null` | - | Selected value, or an array of values in `multiple` mode |
| variant | `ButtonVariant` | - | Visual style of the trigger button, e.g. `primary` or `ghost` |
| size | `'sm' \| 'md' \| 'lg'` | - | Size of the trigger button, falls back to the config provider size |
| shape | `'default' \| 'square' \| 'rounded'` | - | Trigger button shape: `default`, `square` or `rounded` |
| options | `ListOptions` | - | Options to display, entries with `type: 'group'` render as groups |
| disabled | `boolean` | - | Disable the trigger and stop the menu from opening |
| multiple | `boolean` | - | Allow several options to be selected, value becomes an array |
| virtual | `boolean` | `false` | Enable virtualized rendering for large option sets |
| suffix-icon | `boolean` | `true` | Show the chevron icon in the trigger suffix |
| placeholder | `string` | - | Text shown in the trigger while nothing is selected |
| label-format | `(items: ListOption[]) => string` | - | Build the trigger label from the selected options |
| close-on-press-escape | `boolean` | - | Close the menu when `Escape` is pressed |

## Events

| Name | Description |
| --- | --- |
| update:modelValue | Emitted whenever the selected value changes. In multiple mode this fires on every toggle. |
| change | Single: after an option is chosen. Multiple: when the menu closes after the selection changed. |
