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
      {
        label: 'Image Explorer',
        value: 'image-explorer',
        keywords: ['image', 'explorer', 'viewer', 'file', 'assets'],
      },
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

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| width | `string \| number` | `640px` | Width of the inner dialog, forwarded to `PModal` |
| model-value | `boolean` | `false` | Whether the full-screen command menu is open |
| options | `ListOptions` | - | Items or `group` entries, fuzzy-matched against the typed keyword |
| virtual | `boolean` | `false` | Enable virtualized rendering for large option sets |
| placeholder | `string` | `` | Placeholder for the filter input |
| close-on-select-item | `boolean` | `true` | Close the menu after an item is selected |
| close-on-press-escape | `boolean` | `true` | Close the menu when `Esc` is pressed |
| close-on-click-overlay | `boolean` | `true` | Close the menu when the overlay is clicked |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:modelValue | `(value: boolean) => void` | Emitted when the open state of the menu changes. |
| change | `(value: boolean) => void` | Emitted together with `update:modelValue` when the open state of the menu changes. |
| show | `() => void` | Emitted when the menu opens. |
| hide | `() => void` | Emitted when the menu closes. |

## Slots

| Name | Description |
| --- | --- |
| item | Custom item content: `{ item, index, group, groupIndex }` |
| group | Custom group label: `{ group, index }` |
| footer | Footer slot |
