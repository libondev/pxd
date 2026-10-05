# Tree

Tree view driven by the `data` prop, with expandable parents, single or cascading multiple
selection, disabled nodes, built-in search and virtualized rows for large trees.

## Default

Use `v-model` to bind the selected value, click a parent row or its arrow to expand it.

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

Set `multiple` to show a checkbox on every row. Checking a parent checks its whole subtree, a
partially checked parent stays out of the model.

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

Checking a parent normally cascades through its subtree. Set `check-strictly` to keep every
node on its own: the model holds exactly the values that were picked, a parent never lights up
because its children are checked, and no row shows the partial state.

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
  default-expanded-keys="['src']"
  :data="data"
/>
</template>
```

## Expand on click

`expand-on-click` is `true` by default, a parent row expands its children. Set it to `false` to
let the row toggle the selection instead and keep the arrow as the only expand control.

```vue demo
<script setup>
const data = [
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PTree class="w-72 max-h-64" :data="data" :expand-on-click="false" />
</template>
```

## Disabled

A disabled node cannot be selected and is skipped while navigating, its arrow still expands it.

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

Set `filterable` to render a search field. Matching is fuzzy, every matched node keeps its
ancestor chain visible, `highlight-match` marks the matched substring.

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

## Virtual

Set `virtual` to render only the visible rows. The container needs a height, `item-size` is the
row height in pixels and `over-scan` the extra rows kept above and below the viewport.

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

Bind `expanded-keys` to drive the expansion, the tree emits the next set on every change.

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

The tree handles its own keyboard: `ArrowUp` and `ArrowDown` move the active row, `ArrowRight`
expands or enters a subtree, `ArrowLeft` collapses or jumps to the parent, `Home` and `End`
jump to both ends, `Enter` and `Space` toggle the selection.

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

Every icon is a slot, the built-in graphic is only the fallback. The switcher keeps its own
click target and `aria-expanded`, a custom arrow stays clickable.

```vue demo
<script setup>
const data = [
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PTree class="w-72 max-h-64" :data="data">
    <template #node-switcher="{ expanded }">
      <span class="text-xs">{{ expanded ? '-' : '+' }}</span>
    </template>

    <template #node-icon="{ node, expanded }">
      <span class="text-xs">{{ node.value === 'docs' ? '#' : expanded ? 'v' : '>' }}</span>
    </template>
  </PTree>
</template>
```

## Matches-only search

While searching, the tree keeps every hit and the ancestors it sits under, so a match deep in
the tree stays reachable. Set `search-matches-only` when the ancestors are noise: the rows become
the hits alone, flattened to the top level.

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

## Restricting where a node may land

`allow-drop` replaces the built-in policy. The structural rules always hold - a node never lands
on itself or inside its own subtree - but everything else is yours: the callback sees the dragged
node, the row under the pointer and the position, and a `false` means no indicator is drawn.

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
  allow-drop="allowDrop"
  class="w-72 max-h-64"
  default-expanded-keys="['src']"
  draggable
  :data="data"
/>
</template>
```

Add `node-drag-preview` to replace the card that follows the pointer.

```vue demo
<script setup>
import { ref } from 'vue'

const data = ref([
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
])
</script>

<template>
<PTree v-model:data="data" class="w-72 max-h-64" draggable :data="data">
  <template #node-drag-preview="{ node }">
    <span class="text-foreground-secondary">{{ node.label }}</span>
  </template>
</PTree>
</template>
```
## Drag and drop

Set `draggable` to reorder the tree. A drop never changes the tree on its own: it emits
`update:data` with the next shape, so bind it with `v-model:data` (or `.sync` / a manual
`@update:data` listener on Vue 2). Hovering a collapsed parent opens it after a moment, so a
node can be dropped into a subtree that was not visible yet. Dragging is off while a search is
active, because a query hides whole branches and a position inside the result would not mean
the same thing in the full tree.

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
  <PTree v-model:data="data" draggable class="w-72 max-h-64" />
</template>
```

Add the `node-drag-handle` slot to drag from a grip instead of the whole row. That is what
keeps the gesture usable on touch, where a vertical drag and a scroll are the same movement.

```vue demo
<script setup>
import { ref } from 'vue'

const data = ref([
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
])
</script>

<template>
<PTree v-model:data="data" draggable class="w-72 max-h-64">
  <template #node-drag-handle>
    <span class="text-xs text-foreground-secondary">::</span>
  </template>
</PTree>
</template>
```

## Methods

A template `ref` reaches the expand and collapse helpers.

```vue demo
<script setup>
import { ref } from 'vue'

const tree = ref()

const data = [
  { label: 'src', value: 'src', children: [{ label: 'tree', value: 'tree' }] },
  { label: 'docs', value: 'docs' },
]
</script>

<template>
  <PStack gap="2">
    <PTree ref="tree" class="w-72 max-h-64" :data="data" />

    <PButton size="sm" @click="tree?.expandAll()"> Expand all </PButton>
    <PButton size="sm" @click="tree?.collapseAll()"> Collapse all </PButton>
  </PStack>
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
| expand-on-click | `boolean` | `true` | Expand a parent when its row is clicked and select it too in single mode, set it to `false` to select instead |
| draggable | `boolean` | `false` | Allow a row to be dragged to another position, off while searching or when `disabled` is set |
| allow-drop | `(info: TreeDropInfo) => boolean` | disabled nodes | Decide whether a drop may land, overriding the built-in policy |
| show-icon | `boolean` | `true` | Show the built-in folder icon on every row |
| search-matches-only | `boolean` | `false` | While searching, render the hits alone instead of the hits plus their ancestors |
| virtual | `boolean` | `false` | Enable virtualized rendering for large trees |
| item-size | `number` | `32` | Row height in px when `virtual` is enabled |
| over-scan | `number` | `4` | Extra rows rendered outside the viewport when `virtual` is enabled |
| height | `number \| string` | - | Height of the tree, required by `virtual` |
| indent | `number` | `16` | Indentation added per depth level in px |
| expanded-keys | `ComponentValue[]` | - | Controlled expanded nodes |
| default-expanded-keys | `ComponentValue[]` | `[]` | Expanded nodes before the user changes them |
| children-field | `string` | `'children'` | Field of a node holding its children |
| filterable | `boolean` | `false` | Render the search field |
| filter | `(node: TreeOption, query: string) => boolean` | fuzzy match | Predicate deciding whether a node matches |
| highlight-match | `boolean` | `false` | Mark the matched substring of the label |
| search-placeholder | `string` | `'Search'` | Placeholder of the search field |
| item-class | `ComponentClass` | - | Class merged into every rendered row |

### TreeOption

| Name | Type | Description |
| --- | --- | --- |
| value | `string \| number` | Identifier of the node, unique in the whole tree |
| label | `string \| number \| null` | Text of the node |
| children | `TreeOption[]` | Child nodes, read from `children-field` |
| disabled | `boolean` | Ignore selection and skip the node while navigating |
| keywords | `string[]` | Extra terms matched by the built-in filter |

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
| update:searchValue | `(query: string) => void` | Emitted when the search field changes. |

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
| node | Replaces the whole row content. Slot props: `node`, `depth`, `expanded`, `checked`, `indeterminate`. |
| node-switcher | Expand arrow. Slot props: `node`, `depth`, `expanded`. |
| node-icon | Node icon. Slot props: `node`, `depth`, `expanded`. |
| node-content | Node text. Slot props: `node`, `depth`. |
| node-suffix | Content appended to the row. Slot props: `node`. |
| node-drag-handle | Grip that starts a drag. Rendering it restricts dragging to the grip, leaving the row to click. Slot props: `node`, `depth`. |
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
| getCheckedKeys | `(includeIndeterminate?: boolean) => ComponentValue[]` | Return the checked values, optionally including the partially checked ones. |
| getVisibleKeys | `() => ComponentValue[]` | Return the values of the rendered rows. |
| getData | `(value: ComponentValue) => TreeOption \| undefined` | Return the source node of a key, collapsed rows included. |
| activeIndex | `number` | Index of the active row, `-1` when there is none. |
