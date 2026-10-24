# Todo List

Render a checklist that walks items through a workflow.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const options = ref([
  { id: 'types', content: 'Rewrite types.d.ts / utils.ts / index.vue', status: 'in_progress' },
  { id: 'remove', content: 'Delete the legacy components', status: 'pending' },
  { id: 'tests', content: 'Rewrite tests/components/todo-list.test.ts', status: 'pending' },
  { id: 'docs', content: 'Rewrite the docs page', status: 'completed' },
])

function onChange({ item, status }) {
  console.log(item.content, status)
}
</script>

<template>
  <PTodoList v-model="options" title="Tasks" @change="onChange" />
</template>
```

## Simple

`variant="simple"` drops the card background, border and header padding, so the plan sits inline like `PReasoning`.

```vue demo
<script setup>
import { ref } from 'vue'

const options = ref([
  { content: 'Read the failing snapshot diff', status: 'completed' },
  { content: 'Rewrite the todo-list docs page', status: 'in_progress' },
  { content: 'Re-run the component tests', status: 'pending' },
])
</script>

<template>
  <PTodoList :options="options" variant="simple" title="Plan" />
</template>
```

## Readonly

`readonly` renders an agent's plan without any interaction — the status buttons are disabled
and rows no longer react to clicks, while the exposed methods stay inert.

```vue demo
<script setup>
import { ref } from 'vue'

const options = ref([
  { content: 'Count TODO markers across packages', status: 'completed' },
  { content: 'Read failing test and its fixture', status: 'completed' },
  { content: 'Rename config key in every cordis.yml', status: 'in_progress' },
  { content: 'Summarise the findings', status: 'pending' },
])
</script>

<template>
  <PTodoList :options="options" readonly />
</template>
```

## Uncontrolled

Without `v-model` the component keeps the new status internally and emits `change`; replacing
the `options` array re-syncs it.

```vue demo
<script setup>
import { ref } from 'vue'

const options = ref([
  { content: 'Review items in your cart', status: 'pending' },
  { content: 'Choose a payment method', status: 'pending' },
  { content: 'Order confirmed', status: 'pending' },
])

const last = ref('')
</script>

<template>
  <PTodoList
    :options="options"
    @change="({ status }) => (last = `${last ? last + ' → ' : ''}${status}`)"
  >
  </PTodoList>

  <p class="mt-3 text-sm text-foreground-secondary">{{ last }}</p>
</template>
```

## Expanded

`expand` is a command, not a binding: the list applies it whenever the value changes and keeps folding itself on click.

```vue demo
<script setup>
import { ref } from 'vue'

const options = ref([
  { content: 'Find files, not directories, whose paths match a glob pattern', status: 'in_progress' },
  { content: 'Search file contents with a ripgrep regular expression', status: 'pending' },
  { content: 'Collect every still-relevant job before the final answer', status: 'pending' },
])

const expanded = ref(false)
</script>

<template>
  <PButton @click="expanded = !expanded">{{ expanded ? 'Fold' : 'Unfold' }}</PButton>

  <PTodoList :options="options" :expand="expanded" class="mt-3" />
</template>
```

## Description

```vue demo
<script setup>
import { ref } from 'vue'

const options = ref([
  {
    content: 'Rewrite the resizable types',
    description: 'Double insert plus number[] boundary cases',
    status: 'in_progress',
  },
  { content: 'Run type-check / tests / lint', description: '', status: 'pending' },
  { content: 'Delete three obsolete tests', status: 'completed' },
  { content: 'Write the pitfalls entry', status: 'canceled' },
])
</script>

<template>
  <PTodoList :options="options" title="Plan" />
</template>
```

## Empty

```vue demo
<template>
  <PTodoList :options="[]" empty="Nothing planned yet" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `TodoOption[]` | - | Bound list state; takes precedence over `options`. |
| default-value | `TodoOption[]` | - | List state used before the consumer binds `v-model`. |
| options | `TodoOption[]` | `[]` | Items to render while uncontrolled; each entry is `{ id?, content?, description?, status?, disabled? }`. |
| variant | `'default' \| 'simple'` | `default` | `simple` drops the card background, border and header padding. |
| readonly | `boolean` | `false` | Render as a static list: status buttons are disabled and rows ignore clicks. |
| expand | `boolean` | `true` | Expanded state, applied whenever the value changes. |
| title | `ComponentLabel` | `locale.todo.title` | Header title. |
| empty | `ComponentLabel` | `locale.results.noData` | Text shown when there is no item. |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(detail: TodoChangeDetail) => void` | Emitted when an item moves to another status. |
| update:model-value | `(options: TodoOption[]) => void` | Emitted together with `change`, carrying the next list state. |

`detail` reports which item moved and what the whole list becomes:

```ts
interface TodoChangeDetail {
  item: TodoOption
  index: number
  status: TodoStatus
  prevStatus: TodoStatus
  options: TodoOption[]
}
```

## Slots

| Name | Description |
| --- | --- |
| header | Replaces the header content. Slot props: `expanded`, `stats`, `title`, `summary`. |
| item | Replaces a whole row, including its status button. Slot props: `item`, `index`, `status`, `toggle`. |
| item-content | Replaces the text block of a row. Slot props: `item`, `index`, `status`. |
| empty | Replaces the empty-state text. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| stats | `TodoStats` | Item counts per status, plus `total`. |
| start | `(target: TodoItemKey) => void` | Move an item to `in_progress`. |
| complete | `(target: TodoItemKey) => void` | Move an item to `completed`. |
| cancel | `(target: TodoItemKey) => void` | Move an item to `canceled`. |
| reset | `(target: TodoItemKey) => void` | Move an item back to `pending`. |

Every `target` is an option `id`, falling back to its index.
