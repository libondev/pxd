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

## Filterable

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const options = [
  { label: 'Apple', value: 'apple' },
  { label: 'Banana', value: 'banana' },
  { label: 'Cherry', value: 'cherry' },
  { label: 'Durian', value: 'durian' },
  { label: 'Grape', value: 'grape' },
  { label: 'Mango', value: 'mango' },
]
</script>

<template>
  <PSelect
    v-model="value"
    class="w-full"
    filterable
    filter-placeholder="Search"
    :options="options"
    placeholder="Please select"
  />
</template>
```

## Virtual

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const options = Array.from({ length: 2000 }, (_, index) => ({
  label: `Option ${index + 1}`,
  value: index + 1,
}))
</script>

<template>
  <PSelect
    v-model="value"
    class="w-full"
    virtual
    :options="options"
    placeholder="Please select"
  />
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
| filterable | `boolean` | `false` | Show a search input at the top of the popover that filters the options |
| filter-placeholder | `string` | - | Placeholder of the search input shown when `filterable` is on |
| label-format | `(items: ListOption[]) => string` | - | Build the trigger label from the selected options |
| close-on-press-escape | `boolean` | - | Close the menu when `Escape` is pressed |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: ListModelValue) => void` | Emitted when the selection is committed, right after an option is picked in single mode and once when the popover closes in multiple mode. |
| update:model-value | `(value: ListModelValue) => void` | Emitted whenever the selected value changes. In multiple mode this fires on every toggle. |

## Slots

| Name | Description |
| --- | --- |
| default | Trigger label. Slot props: `label`. |
| prefix | Leading area inside the trigger button. |
| item | Option content. Slot props: `item`, `index`, `group`, `group-index`. |
| empty | Shown when the visible option list is empty. |
