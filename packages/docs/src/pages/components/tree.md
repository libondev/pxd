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
| disabled | `boolean` | `false` | Disable the selection and the keyboard of the whole tree |
| expand-on-click | `boolean` | `true` | Expand a parent when its row is clicked and select it too in single mode, set it to `false` to select instead |
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
