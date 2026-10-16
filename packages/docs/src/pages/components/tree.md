# Tree

Tree view driven by the `data` prop, with expandable parents and single or cascading multiple selection.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(null)

const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components', children: [{ label: 'tree', value: 'tree' }] },
      { label: 'composables', value: 'composables' },
    ],
  },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PTree v-model="value" class="w-72 max-h-64" :data="data" />
</template>
```

## Multiple

A shift-click takes the span between two rows in document order, starting where the selection last
landed; a further one moves that span, and a disabled row is neither an end nor part of one.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([])

const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components' },
      { label: 'composables', value: 'composables' },
      { label: 'context', value: 'context' },
      { label: 'utils', value: 'utils' },
    ],
  },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PTree v-model="value" class="w-72 max-h-64" multiple :data="data" />
</template>
```

## Independent selection

Every node is selected on its own: no cascading, no partial state.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(['composables'])

const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components' },
      { label: 'composables', value: 'composables' },
    ],
  },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PTree
    v-model="value"
    class="w-72 max-h-64"
    multiple
    check-strictly
    :data="data"
    :default-expanded-keys="['src']"
  />
</template>
```

## Selectable nodes

A refused node keeps its looks, expands and takes drops; only the selection is out of reach. Under
`multiple` it is never checked itself, but still reports a partial state.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref([])

const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'index.vue', value: 'index.vue', saved: true },
      { label: 'tree', value: 'tree', saved: true },
      { label: 'utils.ts', value: 'utils.ts' },
    ],
  },
  { label: 'README.md', value: 'README.md' },
]
</script>

<template>
  <PTree
    v-model="value"
    class="w-72 max-h-64"
    multiple
    :data="data"
    :default-expanded-keys="['src']"
    :selectable="(node) => !node.saved"
  />
</template>
```

## Expand only

A parent row becomes a handle for its subtree: the click opens or closes it, and under `multiple`
only the checkbox selects. To refuse a node whatever is clicked, reach for `selectable`.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref()

const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'index.vue', value: 'index.vue' },
      { label: 'tree', value: 'tree', children: [{ label: 'types.d.ts', value: 'types.d.ts' }] },
    ],
  },
  { label: 'README.md', value: 'README.md' },
]
</script>

<template>
  <PTree v-model="value" class="w-72 max-h-64" expand-only :data="data" />
</template>
```

## Disabled

A disabled node is skipped by the keyboard, but its arrow still expands it.

```vue demo
<script setup>
const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components' },
      { label: 'locked', value: 'locked', disabled: true },
    ],
  },
]
</script>

<template>
  <PTree class="w-72 max-h-64" multiple :data="data" :default-expanded-keys="['src']" />
</template>
```

## Search

A match keeps its ancestor chain visible. Replacing the content through `node-content` also means
drawing the `highlight-match` mark yourself: the slot receives `parts`, the label split into
`{ text, matched }` runs.

```vue demo
<script setup>
const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components', children: [{ label: 'tree', value: 'tree' }] },
      { label: 'composables', value: 'composables' },
    ],
  },
  { label: 'readme.md', value: 'readme' },
]
</script>

<template>
  <PTree class="w-72 max-h-64" filterable highlight-match :data="data">
    <template #empty>No match.</template>
  </PTree>
</template>
```

## Remote search

Giving `remote-filter` turns the search remote: a non-empty query goes to it 200ms after the last
keystroke instead of through the local `filter`. It hands back the matched nodes with their
ancestors, and that forest replaces `data` while the query is active, at its real depths with the
chains to a hit opened; `search-matches-only` flattens it. Only the latest answer counts, the field
spins while a request is in flight, and the `empty` slot covers one. Clearing the query restores
`data`.

```vue demo
<script setup>
const source = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components', children: [{ label: 'tree', value: 'tree' }] },
      { label: 'composables', value: 'composables' },
    ],
  },
  { label: 'docs', value: 'docs' },
]

// A real one would ask a server; the shape it hands back is the same either way.
function search(query) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(keepMatched(source, query)), 500)
  })
}

function keepMatched(nodes, query) {
  const result = []

  for (const node of nodes) {
    const children = keepMatched(node.children ?? [], query)

    if (children.length || node.label.includes(query)) {
      result.push(children.length ? { ...node, children } : { ...node, children: undefined })
    }
  }

  return result
}
</script>

<template>
  <PTree class="w-72 max-h-64" filterable :data="source" :remote-filter="search" />
</template>
```

## Virtual

The container needs a `height`.

```vue demo
<script setup>
const data = Array.from({ length: 2000 }, (_, index) => ({
  label: 'Folder ' + index,
  value: 'folder-' + index,
  children: [{ label: 'File ' + index, value: 'file-' + index }],
}))
</script>

<template>
  <PTree class="w-72" virtual :data="data" :height="240" :item-size="32" />
</template>
```

## Controlled expansion

```vue demo
<script setup>
import { ref } from 'vue'

const expandedKeys = ref([])

const data = [
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
]
</script>

<template>
  <PStack gap="2">
    <PTree
      :data="data"
      :expanded-keys="expandedKeys"
      class="w-72 max-h-64"
      @update:expanded-keys="expandedKeys = $event"
    />
    <PText size="sm">{{ expandedKeys.length }} expanded</PText>
  </PStack>
</template>
```

## Keyboard

`ArrowUp`/`ArrowDown` move the active row, `ArrowRight` expands or enters a subtree, `ArrowLeft`
collapses or jumps to the parent, `Home`/`End` jump to both ends, `Enter`/`Space` toggle the
selection.

```vue demo
<script setup>
const data = [
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PTree class="w-72 max-h-64" :data="data" />
</template>
```

## Custom icons

The tree draws no icon of its own: a row shows one only if a slot provides it.

```vue demo
<script setup>
const data = [
  { label: 'src', value: 'src', type: 'folder', children: [{ label: 'tree', value: 'tree', type: 'file' }] },
  { label: 'docs', value: 'docs', type: 'file' },
]
</script>

<template>
  <PTree class="w-72 max-h-64" :data="data">
    <template #node-switcher="{ expanded }">
      <span class="text-xs">{{ expanded ? '-' : '+' }}</span>
    </template>

    <template #node-icon="{ node, expanded, hasChildren }">
      <span class="text-xs">{{ node.type === 'file' ? '#' : expanded ? 'v' : '>' }}</span>
    </template>
  </PTree>
</template>
```

## Matches-only search

The hits are rendered alone, flattened to the top level, instead of together with their ancestors.

```vue demo
<script setup>
const data = [
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components' },
      { label: 'composables', value: 'composables' },
    ],
  },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
<PTree
  class="w-72 max-h-64"
  filterable
  highlight-match
  search-matches-only
  :data="data"
/>
</template>
```

## Drag and drop

A drop emits `update:data` with the next shape, so bind the tree with `v-model:data` (`.sync` /
`@update:data` on Vue 2). Dragging is off while searching, and `drop-inside-leaf` lets a childless
row take the dragged node as its first child.

Touch and pen must hold still for 300ms before they drag, because a finger that moves at once is
scrolling the page; a mouse starts on the first 5px. The tree never scrolls on its own, so a touch
drag reaches only the rows in view.

```vue demo
<script setup>
import { ref } from 'vue'

const data = ref([
  {
    label: 'src',
    value: 'src',
    children: [
      { label: 'components', value: 'components' },
      { label: 'composables', value: 'composables' },
    ],
  },
  { label: 'docs', value: 'docs' },
])
</script>

<template>
  <PTree v-model:data="data" draggable drop-inside-leaf class="w-72 max-h-64" />
</template>
```

## Restricting where a node may land

A node never lands on itself or inside its own subtree, whatever the predicate returns.

```vue demo
<script setup>
import { ref } from 'vue'

const data = ref([
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
  { label: 'lock', value: 'lock', disabled: true },
])

function allowDrop({ targetValue, position }) {
  if (targetValue === 'lock') {
    return false
  }

  return position !== 'after' || targetValue !== 'docs'
}
</script>

<template>
  <PTree
    v-model:data="data"
    class="w-72 max-h-64"
    :allow-drop="allowDrop"
    :default-expanded-keys="['src']"
    draggable
  />
</template>
```

```vue demo
<script setup>
import { ref } from 'vue'

const data = ref([
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
])
</script>

<template>
  <PTree v-model:data="data" class="w-72 max-h-64" draggable>
    <template #node-drag-preview="{ node }">
      <span class="text-foreground-secondary">{{ node.label }}</span>
    </template>
  </PTree>
</template>
```

## Imperative methods

```vue demo
<script setup>
import { shallowRef } from 'vue'

const tree = shallowRef()

const data = [
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PStack gap="2">
    <PButton size="sm" @click="tree?.expandAll()"> Expand all </PButton>
    <PButton size="sm" @click="tree?.collapseAll()"> Collapse all </PButton>

    <PTree ref="tree" class="w-72 max-h-64" :data="data" />
  </PStack>
</template>
```

## Loading

Set `loading` to cover the tree with a mask: the `empty` slot hides, the built-in search field shows
a spinner, and the keyboard and the search input are ignored.

```vue demo
<script setup>
import { ref } from 'vue'

const loading = ref(true)
const data = []
</script>

<template>
  <PStack align="center">
    <PTree class="w-72 max-h-64" filterable :loading="loading" :data="data">
      <template #empty>No folders.</template>
    </PTree>

    <PButton size="sm" @click="loading = !loading"> Toggle </PButton>
  </PStack>
</template>
```

## Lazy loading

With `lazy`, a node without children in `data` still shows an arrow, and the first time it opens
`load` is called with what the tree knows about it (see `TreeLoadDetail`): `resolve(children)` puts
them in the tree, an empty array making the node a leaf, while `reject()` leaves it unloaded so the
next expand asks again. A node that resolved before is never asked twice, one marked `isLeaf` never
at all, and one whose children already sit in `data` is passed over.

Under `draggable`, nothing can be dropped *inside* a parent whose children the tree has not fetched
yet; elsewhere the drop proposes the whole tree through `update:data`, loaded subtrees included.

```vue demo
<script setup>
import { ref } from 'vue'

const data = ref([
  { label: 'src', value: 'src' },
  { label: 'docs', value: 'docs', isLeaf: true },
])

const children = {
  src: [
    { label: 'components', value: 'src/components' },
    { label: 'composables', value: 'src/composables' },
  ],
  'src/components': [{ label: 'tree', value: 'src/components/tree' }],
}

function load({ node }, resolve) {
  setTimeout(() => resolve(children[node.value] ?? []), 600)
}
</script>

<template>
  <PTree class="w-72 max-h-64" lazy :data="data" :load="load" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | `TreeOptions` | `() => []` | Tree data, see `TreeOption` |
| model-value | `TreeModelValue` | `null` | Selected value, an array when `multiple` is set |
| multiple | `boolean` | `false` | Show a checkbox and cascade the selection through the parents |
| check-strictly | `boolean` | `false` | Keep every node independently selectable, without cascading and without the partial state |
| disabled | `boolean` | `false` | Disable the selection and the keyboard of the whole tree |
| selectable | `(node: TreeOption) => boolean` | every node | Keep a node out of the selection without disabling it |
| expand-only | `boolean` | `false` | A row click only opens or closes a parent instead of selecting it; under `multiple` the checkbox selects |
| draggable | `boolean` | `false` | Allow a row to be dragged to another position; off while searching and when `disabled` |
| allow-drop | `(info: TreeDropInfo) => boolean` | disabled nodes | Decide whether a drop may land, overriding the built-in policy |
| drop-inside-leaf | `boolean` | `false` | Let a childless row take the dragged node as its first child |
| search-matches-only | `boolean` | `false` | While searching, render the hits alone instead of the hits plus their ancestors |
| virtual | `boolean` | `false` | Enable virtualized rendering for large trees |
| item-size | `number` | `32` | Row height in px when `virtual` is enabled |
| over-scan | `number` | `4` | Extra rows rendered outside the viewport when `virtual` is enabled |
| height | `number \| string` | - | Height of the tree, required by `virtual` |
| indent | `number` | `16` | Indentation added per depth level in px |
| expanded-keys | `ComponentValue[]` | - | Controlled expanded nodes |
| default-expanded-keys | `ComponentValue[]` | `[]` | Expanded nodes before the user changes them |
| children-field | `string` | `'children'` | Field of a node holding its children |
| lazy | `boolean` | `false` | Fetch the children of a node when it first opens instead of reading them from `data` |
| load | `(detail: TreeLoadDetail, resolve: TreeLoadResolve, reject: TreeLoadReject) => void` | - | Fetch the children of a node nothing else provided: `resolve` hands them over, `reject` leaves it for the next expand |
| loading | `boolean` | `false` | Cover the tree with a loading mask; the search input and the keyboard are ignored |
| filterable | `boolean` | `false` | Render the search field |
| filter | `(node: TreeOption, query: string) => boolean` | fuzzy match | Predicate deciding whether a node matches |
| remote-filter | `(query: string) => TreeOptions \| Promise<TreeOptions>` | - | Search through it instead of the local `filter`: it returns the matched nodes with their ancestors, which replace `data` while the query is active |
| highlight-match | `boolean` | `false` | Mark the matched substring of the label; a fuzzy hit that is not a contiguous run stays unmarked |
| search-placeholder | `string` | `'Search'` | Placeholder of the search field |
| search-value | `string` | - | Controlled search query |
| default-search-value | `string` | `''` | Search query before the user types |
| item-class | `ComponentClass` | - | Class merged into every rendered row |

### TreeOption

| Name | Type | Description |
| --- | --- | --- |
| value | `string \| number` | Identifier of the node, unique in the whole tree |
| label | `string \| number \| null` | Text of the node |
| children | `TreeOption[]` | Child nodes, read from `children-field` |
| isLeaf | `boolean` | Mark a leaf under `lazy`: no arrow, and never handed to `load` |
| disabled | `boolean` | Ignore selection and skip the node while navigating |
| keywords | `string[]` | Extra terms matched by the built-in filter |

### TreeLoadDetail

| Name | Type | Description |
| --- | --- | --- |
| node | `TreeOption` | The node whose children are asked for |
| depth | `number` | Depth of the node, `0` at the top level |
| parent | `TreeOption` | The node holding it, absent at the top level |

## Events

| Name | Type | Description |
| --- | --- | --- |
| update:modelValue | `(value: TreeModelValue) => void` | Emitted when the selection changes. |
| update:data | `(data: TreeOptions) => void` | Emitted when a drag is dropped, carrying the whole next tree. |
| move | `(detail: TreeMoveDetail) => void` | Emitted when a drag is dropped, carrying where the node came from and landed. |
| change | `(detail: TreeChangeDetail) => void` | Emitted when a node is checked or unchecked. |
| update:expandedKeys | `(keys: ComponentValue[]) => void` | Emitted when a node is expanded or collapsed. |
| expand | `(detail: TreeNodeDetail) => void` | Emitted when a node is expanded. |
| collapse | `(detail: TreeNodeDetail) => void` | Emitted when a node is collapsed. |
| update:searchValue | `(query: string) => void` | Emitted when the search field changes while not loading. Write it back through `search-value` to control the field. |

```ts
interface TreeNodeDetail {
  value: string | number
  node: TreeOption
}

interface TreeChangeDetail extends TreeNodeDetail {
  checked: boolean
  checkedValues: (string | number)[]
  halfCheckedValues: (string | number)[]
}

interface TreeMoveLocation {
  parentValue?: string | number
  index: number
}

interface TreeMoveDetail {
  value: string | number
  node: TreeOption
  from: TreeMoveLocation
  to: TreeMoveLocation & {
    targetValue: string | number
    position: 'before' | 'inside' | 'after'
  }
}
```

## Slots

| Name | Description |
| --- | --- |
| node-switcher | Expand arrow, replaced by a spinner while a lazy node loads. Slot props: `node`, `depth`, `expanded`, `loading`. |
| node-icon | Node icon, nothing is drawn without it. Slot props: `node`, `depth`, `expanded`, `hasChildren`. |
| node-content | Node text. Slot props: `node`, `depth`, `hasChildren`, `parts` (the label split for `highlight-match`, `undefined` when nothing is marked). |
| node-suffix | Content appended to the row. Slot props: `node`, `hasChildren`. |
| node-drag-preview | Card that follows the pointer while dragging. Slot props: `node`. |
| search | Replaces the search field. |
| empty | Content shown when the tree has no row, or the search matched nothing. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| focus | `() => void` | Focus the tree so it receives the keyboard. |
| scrollToKey | `(value: ComponentValue) => void` | Scroll the row of the node into view. |
| setActiveKey | `(value: ComponentValue) => void` | Move the active row to the node. |
| expandKey | `(value: ComponentValue) => void` | Expand the node. |
| collapseKey | `(value: ComponentValue) => void` | Collapse the node. |
| expandAll | `() => void` | Expand every parent node. |
| collapseAll | `() => void` | Collapse every node. |
| getCheckedKeys | `(includeIndeterminate?: boolean) => ComponentValue[]` | Return the checked values in document order, optionally including the partially checked ones. Covers collapsed subtrees, the same set `change` reports. |
| getVisibleKeys | `() => ComponentValue[]` | Return the values of the rendered rows. |
| getData | `(value: ComponentValue) => TreeOption \| undefined` | Return the source node of a key, collapsed rows included. |
| activeIndex | `number` | Index of the active row, `-1` when there is none. |
