# Select

Displays a list of options for the user to pick from—triggered by a button.

## Default

The component inherits from popover and supports all the properties of popover. For details, See: [Popover](/components/popover).

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
  <PSelect v-model="value" :options="options" placeholder="Please select"></PSelect>
</template>
```

## Clearable

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(2)

const options = [
  { label: 'One', value: 1 },
  { label: 'Two', value: 2 },
  { label: 'Three', value: 3 },
]
</script>

<template>
  <PSelect v-model="value" :options="options" clearable></PSelect>
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
  <PSelect v-model="value" :options="options" multiple />
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
  <PSelect v-model="value" :options="options" multiple :label-format="labelFormatter" />
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
    filterable
    search-placeholder="Search"
    :options="options"
    placeholder="Please select"
  />
</template>
```

## Custom filter

`filter-method` replaces the built-in fuzzy match with a predicate over the whole option, so aliases
or any other field can match the query.

```vue demo
<script setup>
import { ref } from 'vue'
import { isFuzzyMatch } from 'pxd/utils/fuzzy-match'

const value = ref('')

const options = [
  { label: 'Preferences', value: 'preferences', aliases: ['settings', 'config'] },
  { label: 'Delete Workspace', value: 'delete-workspace', aliases: ['remove', 'trash'] },
]

function filter(option, query) {
  return isFuzzyMatch(`${option.label} ${option.aliases.join(' ')}`, query)
}
</script>

<template>
  <PSelect
    v-model="value"
    filterable
    search-placeholder="Search"
    placeholder="Please select"
    :options="options"
    :filter-method="filter"
  />
</template>
```

## Remote search

`remote-filter` turns the search remote: a non-empty query goes to it 200ms after the last
keystroke instead of through the local `filter-method`, and the options it returns replace `options`
while the query is active. Only the latest answer counts, and the list shows its loading mask from
the keystroke until one lands. Clearing the query restores `options`.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const options = [
  { label: 'Import Extension', value: 'import-extension' },
  { label: 'Manage Extensions', value: 'manage-extensions' },
  { label: 'Flags Explorer', value: 'flags-explorer' },
]

// A real one would ask a server; the shape it hands back is the same either way.
function search(query) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(options.filter((option) => option.label.includes(query))), 400)
  })
}
</script>

<template>
  <PSelect
    v-model="value"
    filterable
    search-placeholder="Search"
    placeholder="Please select"
    :options="options"
    :remote-filter="search"
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
  <PSelect v-model="value" :suffix-icon="false" :options="options" placeholder="Please select">
    <template #prefix>
      <span class="inline-flex size-2 bg-gray-500 rounded-full" :class="{ 'bg-primary': value }"></span>
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
| clearable | `boolean` | `false` | Show a clear control in the trigger when a value is selected; clearing emits `null` (or `[]` in `multiple` mode) and a `change` with reason `cleared` |
| search-placeholder | `string` | - | Placeholder of the search input shown when `filterable` is on |
| filter-method | `(option: ListOption, query: string) => boolean` | fuzzy match on `label` and `description` | Predicate deciding which option shows while the query is being typed |
| remote-filter | `(query: string) => ListOptions \| Promise<ListOptions>` | - | Search through it instead of the local `filter-method`, only while `filterable` is on: the options it returns replace `options` until the query is cleared. A rejection shows a retryable error in the list |
| label-format | `(items: ListOption[]) => string` | - | Build the trigger label from the selected options |
| match-width | `boolean` | `true` | Match the dropdown width to the trigger width |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: ListModelValue, details: ChangeDetails) => void` | Emitted when the selection is committed, right after an option is picked in single mode and once when the popover closes in multiple mode. |
| update:model-value | `(value: ListModelValue) => void` | Emitted whenever the selected value changes. In multiple mode this fires on every toggle. |
| retry | `() => void` | Emitted when the remote-search error message is clicked; the rejected query is re-run first. |

## Slots

| Name | Description |
| --- | --- |
| default | Trigger label. Slot props: `label`. |
| prefix | Leading area inside the trigger button. |
| item | Option content. Slot props: `item`, `index`, `group`, `group-index`. |
| empty | Shown when the visible option list is empty. |
| suffix | Trigger suffix area. Replaces the default chevron icon. |
| footer | Bottom area of the dropdown, below the option list. |
