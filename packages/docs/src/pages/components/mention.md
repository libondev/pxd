# Mention

Mention people or entities inside rich text with `@`, backed by a searchable suggestion list.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('Hello <at key="1">Alice</at>')

const options = [
  { label: 'Alice', value: '1' },
  { label: 'Bob', value: '2' },
  { label: 'Charlie', value: '3' },
]
</script>

<template>
  <PMention v-model="value" class="max-w-md" :options="options" placeholder="Type @ to mention" search-placeholder="Search..." />
</template>
```

## Async filter

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const all = [
  { label: 'Alice', value: '1', keywords: ['alice'] },
  { label: 'Bob', value: '2', keywords: ['bob'] },
  { label: 'Charlie', value: '3', keywords: ['charlie'] },
  { label: 'Diana', value: '4', keywords: ['diana'] },
]

async function filterMethod(query) {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const needle = query.toLowerCase()
  return all.filter((item) => item.label.toLowerCase().includes(needle))
}
</script>

<template>
  <PMention
    v-model="value"
    class="max-w-md"
    :filter-method="filterMethod"
    placeholder="Type @ then search in the popover"
    search-placeholder="Filter people"
  />
</template>
```

## Mention click

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('Ping <at key="1">Alice</at>')
const last = ref('')

const options = [
  { label: 'Alice', value: '1' },
  { label: 'Bob', value: '2' },
]
</script>

<template>
  <PStack direction="vertical" class="max-w-md">
    <PMention
      v-model="value"
      :options="options"
      placeholder="Type @ to mention"
      search-placeholder="Search..."
      @mention-click="(payload) => (last = `${payload.label}#${payload.key}`)"
    />
    <PText v-if="last" class="text-sm text-foreground-secondary">Clicked: {{ last }}</PText>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `string` | `''` | Mention HTML: text + `<at key="...">label</at>` |
| options | `ListOptions` | `[]` | Default options when the popover opens with an empty query |
| filter-method | `(query: string) => ListOptions \| Promise<ListOptions>` | - | Async/sync search; errors fall back to an empty list |
| placeholder | `string` | `''` | Editor placeholder |
| search-placeholder | `string` | `''` | Suggestion search input placeholder |
| disabled | `boolean` | `false` | - |
| close-on-press-escape | `boolean` | `true` | - |

## Events

| Name | Description |
| --- | --- |
| update:modelValue | Fired when editor HTML changes |
| change | Fired with the same HTML as `update:modelValue` |
| mention-click | Fired when a mention chip is clicked: `{ key, label, event }` |

## Slots

| Name | Description |
| --- | --- |
| item | Custom list item: `{ item, index, group, groupIndex }` |
| group | Custom group label: `{ group, index }` |
| empty | Custom empty search result content |

## Notes

- Type `@` in the editor to open suggestions. The `@` stays until you pick an item (so typing a literal `@` remains possible if you dismiss the popover).
- Mentions are read-only chips (`contenteditable="false"`). Backspace removes a whole chip.
- Paste keeps only legal `<at key>` nodes; everything else becomes plain text.
- Undo/redo uses the browser's native contenteditable history (`Ctrl/Cmd+Z`, etc.).
