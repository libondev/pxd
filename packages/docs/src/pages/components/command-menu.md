# Command Menu

Launch a set of actions as a full-screen overlay.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const showCommandMenu = ref(false)

const options = [
  {
    type: 'group',
    label: 'Suggestions',
    options: [{ label: 'Figma Import', value: 'figma-import' }],
  },
  {
    type: 'group',
    label: 'Commands',
    options: [
      { label: 'Import Extension', value: 'import-extension' },
      { label: 'Manage Extensions', value: 'manage-extensions' },
    ],
  },
  {
    type: 'group',
    label: 'Collaboration',
    options: [
      { label: 'Flags Explorer', value: 'flags-explorer' },
      { label: 'File Explorer', value: 'file-explorer' },
      { label: 'Image Explorer', value: 'image-explorer' },
    ],
  },
]
</script>

<template>
  <PButton variant="primary" @click="showCommandMenu = true"> Open Command Menu </PButton>

  <PCommandMenu v-model="showCommandMenu" :options="options" placeholder="What do you need?">
    <template #item="{ item }">
      {{ item.label }}
    </template>
  </PCommandMenu>
</template>
```

## Remote search

`remote-filter` hands every query to it 200ms after the last keystroke instead of going through the
local `filter-method`, and the options it returns replace `options` while the query is active. Only
the latest answer counts, and the list shows its loading mask until one lands. Clearing the input
restores `options`.

```vue demo
<script setup>
import { ref } from 'vue'

const showCommandMenu = ref(false)

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
  <PButton variant="primary" @click="showCommandMenu = true"> Open Command Menu </PButton>

  <PCommandMenu
    v-model="showCommandMenu"
    placeholder="What do you need?"
    :options="options"
    :remote-filter="search"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| width | `string \| number` | `640px` | Width of the inner dialog, forwarded to `PModal` |
| model-value | `boolean` | `false` | Whether the full-screen command menu is open |
| options | `ListOptions` | - | Items or `group` entries, fuzzy-matched against the typed keyword |
| filter-method | `(option: ListOption, query: string) => boolean` | fuzzy match on `label` and `description` | Predicate deciding which option shows while the keyword is being typed |
| remote-filter | `(query: string) => ListOptions \| Promise<ListOptions>` | - | Search through it instead of the local `filter-method`; the options it returns replace `options` while the query is active |
| virtual | `boolean` | `false` | Enable virtualized rendering for large option sets |
| placeholder | `string` | `` | Placeholder for the filter input |
| close-on-select-item | `boolean` | `true` | Close the menu after an item is selected |
| close-on-press-escape | `boolean` | `true` | Close the menu when `Esc` is pressed |
| close-on-click-overlay | `boolean` | `true` | Close the menu when the overlay is clicked |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:model-value | `(value: boolean) => void` | Emitted when the open state of the menu changes. |
| change | `(value: boolean) => void` | Emitted together with `update:model-value` when the open state of the menu changes. |
| show | `() => void` | Emitted when the menu opens. |
| hide | `() => void` | Emitted when the menu closes. |

## Slots

| Name | Description |
| --- | --- |
| item | Custom item content: `{ item, index, group, groupIndex }` |
| group | Custom group label: `{ group, index }` |
| footer | Footer slot |
