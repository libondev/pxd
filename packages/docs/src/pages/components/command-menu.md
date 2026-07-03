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
| width | `string \| number` | - | - |
| model-value | `boolean` | `false` | - |
| options | `ListOptions` | - | - |
| placeholder | `string` | `` | - |
| close-on-select-item | `boolean` | `true` | - |
| close-on-press-escape | `boolean` | `true` | - |
| close-on-click-overlay | `boolean` | `true` | - |

## Slots

| Name | Description |
| --- | --- |
| item | Custom item content: `{ item, index, group, groupIndex }` |
| group | Custom group label: `{ group, index }` |
| footer | Footer slot |
