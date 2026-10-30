# Mention

Mention people or entities inside rich text with `@` or any other configured trigger, backed by a searchable suggestion list.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('Hello <mention key="1">Alice</mention>')

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

## Multiple triggers

`triggers` lists every keyword that opens the popover. When `options` is a function it receives the
keyword that was typed, so one editor can offer files on `@` and commands on `/`.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const files = [
  { label: 'App.vue', value: 'src/App.vue' },
  { label: 'router.ts', value: 'src/router.ts' },
  { label: 'mention-html.ts', value: 'src/utils/mention-html.ts' },
]

const commands = [
  { label: 'review', value: 'review' },
  { label: 'test', value: 'test' },
]

function optionsFor(trigger) {
  return trigger === '/' ? commands : files
}
</script>

<template>
  <PMention
    v-model="value"
    class="max-w-md"
    :triggers="['@', '/']"
    :options="optionsFor"
    placeholder="Type @ for a file or / for a command"
  />
</template>
```

## Per-trigger search

`filter-method` receives the keyword as its second argument, so one search can serve every trigger.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')

const files = ['src/App.vue', 'src/router.ts', 'src/utils/mention-html.ts']
const commands = ['review', 'test', 'lint']

async function filterMethod(query, trigger) {
  await new Promise((resolve) => setTimeout(resolve, 200))
  const source = trigger === '/' ? commands : files
  const needle = query.toLowerCase()

  return source
    .filter((entry) => entry.toLowerCase().includes(needle))
    .map((entry) => ({ label: entry, value: entry }))
}
</script>

<template>
  <PMention
    v-model="value"
    class="max-w-md"
    :triggers="['@', '/']"
    :filter-method="filterMethod"
    placeholder="Type @ for a file or / for a command"
    search-placeholder="Filter..."
  />
</template>
```

## Submit on Enter

`submit` fires with the current HTML on <kbd>Enter</kbd> (`Shift+Enter` still breaks the line, IME
confirmation is untouched). Set `submit-on-enter` to `false` to handle `Enter` yourself.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('')
const sent = ref('')

const options = [
  { label: 'Alice', value: '1' },
  { label: 'Bob', value: '2' },
]

function send(html) {
  sent.value = html
  value.value = ''
}
</script>

<template>
  <PStack direction="vertical" class="max-w-md gap-2">
    <PMention
      v-model="value"
      :options="options"
      :rows="3"
      placeholder="Type @ to mention, press Enter to send"
      @submit="send"
    />
    <PText v-if="sent" class="text-sm text-foreground-secondary">Sent: {{ sent }}</PText>
  </PStack>
</template>
```

## Mention click

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('Ping <mention key="1">Alice</mention>')
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
| model-value | `string` | `''` | Mention HTML: text + `<mention key="...">label</mention>` |
| options | `ListOptions \| ((trigger: string) => ListOptions \| Promise<ListOptions>)` | `() => []` | Options shown when the popover opens; a function receives the trigger that opened it and may return a promise, which keeps the list on its loading state |
| triggers | `string[]` | `() => ['@']` | Keywords that open the popover, in the order they are matched |
| size | `'sm' \| 'md' \| 'lg'` | - | Size of the editor, falls back to the config provider size |
| virtual | `boolean` | `false` | Enable virtualized rendering for large option sets |
| filter-method | `(query: string, trigger: string) => ListOptions \| Promise<ListOptions>` | - | Async/sync search; `trigger` is the keyword that opened the popover |
| filter-debounce | `boolean` | `true` | Debounce the `filter-method` search by 200ms while typing; `false` filters on every keystroke |
| submit-on-enter | `boolean` | `true` | Submit on `Enter` instead of inserting a line break |
| rows | `number` | `1` | Visible lines; `1` keeps the size-based minimum height |
| auto-grow | `boolean` | `true` | Grow the editor with its content; `false` fixes the height at `rows` with internal scrolling |
| max-rows | `number` | - | Cap the height at this many lines and scroll internally beyond it |
| editor-class | `ComponentClass` | - | Class merged into the editable area |
| editor-attrs | `Record<string, unknown>` | - | Attributes bound to the editable area (`data-*`, `aria-*`, …) |
| before-insert | `(payload: MentionSelectPayload) => boolean \| void` | - | Return `false` to skip the default chip insertion and write the value yourself |
| placeholder | `string` | `''` | Editor placeholder |
| search-placeholder | `string` | `''` | Suggestion search input placeholder |
| disabled | `boolean` | `false` | Make the editor read-only and stop the suggestion popover from opening |
| close-on-press-escape | `boolean` | `true` | Close the suggestion popover when pressing `Escape` |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: string) => void` | Emitted when the editor HTML changes. |
| submit | `(value: string) => void` | Emitted when `Enter` is pressed with `submit-on-enter` enabled. |
| select | `(payload: MentionSelectPayload) => void` | Emitted when an option is picked, before the chip is inserted. |
| mention-click | `(payload: MentionClickPayload) => void` | Emitted when a mention chip is clicked. |
| update:model-value | `(value: string) => void` | Emitted when the editor HTML changes. |

```ts
interface MentionSelectPayload {
  key: string
  label: string
  trigger: string
  item: ListOptionSelected
}

interface MentionClickPayload {
  key: string
  label: string
  trigger: string
  event: MouseEvent
}
```

## Slots

| Name | Description |
| --- | --- |
| item | Custom list item: `{ item, index, group, groupIndex }` |
| group | Custom group label: `{ group, index }` |
| empty | Custom empty search result content |
| footer | Bottom area of the dropdown, below the option list. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| focus | `() => void` | Focus the editor. |
| blur | `() => void` | Blur the editor. |
| clear | `() => void` | Empty the editor and emit the cleared value. |
| setText | `(text: string) => void` | Replace the content with escaped plain text and park the caret at the end. |
| insertText | `(text: string) => boolean` | Insert escaped plain text at the caret, or at the end when the editor is not focused. |
| insertMention | `(key: string, label: string, trigger?: string) => boolean` | Insert a chip; replaces the active trigger span, otherwise inserts at the caret with the given trigger (`'@'` by default). |
| replaceQuery | `(text: string) => boolean` | Replace the active trigger span with escaped plain text, or delete it when empty; only works while a trigger span is alive, e.g. from a `select` / `before-insert` handler. |
| openSuggest | `(trigger?: string) => void` | Open the suggestion popover for a trigger, the first configured one by default. |
| closeSuggest | `() => void` | Close the suggestion popover. |

## Notes

- Type a configured trigger in the editor to open suggestions. It stays until you pick an item (so typing a literal `@` remains possible if you dismiss the popover).
- A trigger only fires at content start, after whitespace, or right after a chip — never mid-word, so `@` inside an email or URL stays plain text.
- `Escape` closes the popover through the search input and the overlay.
- Chips carry the trigger that created them in a `trigger` attribute, omitted for the default `@`: `<mention key="review" trigger="/">review</mention>`.
- Mentions are read-only chips (`contenteditable="false"`). Backspace removes a whole chip.
- Paste keeps only legal `<mention key>` nodes; everything else becomes plain text.
- Undo/redo uses the browser's native contenteditable history (`Ctrl/Cmd+Z`, etc.).
- `pxd/utils/mention-html` exports the value-format helpers: `mentionHtmlToText`, `parseMentionHtml` and `escapePlainTextAsHtml` for plain-text output, token parsing and safe refills.
