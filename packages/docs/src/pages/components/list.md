# List

Scrollable listbox driven by the `options` prop, with groups, single or multiple selection,
keyboard navigation and virtualized rows for large option sets.

## Default

Use `v-model` to bind the selected value.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('manage-extensions')

const options = [
  { label: 'Figma Import', value: 'figma-import', description: 'Jump to figma import' },
  { label: 'Import Extension', value: 'import-extension', description: 'Jump to import extension' },
  { label: 'Manage Extensions', value: 'manage-extensions', description: 'Jump to manage extensions' },
]
</script>

<template>
  <PList v-model="value" class="w-64" :options="options" />
</template>
```

## Multiple

Set `multiple` to select several options, the model becomes an array.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref(['import-extension'])

const options = [
  { label: 'Figma Import', value: 'figma-import' },
  { label: 'Import Extension', value: 'import-extension' },
  { label: 'Manage Extensions', value: 'manage-extensions' },
  { label: 'Flags Explorer', value: 'flags-explorer' },
]
</script>

<template>
  <PList v-model="value" class="w-64" multiple :options="options" />
</template>
```

## Groups

A `group` entry renders a non-navigable header followed by its options.

```vue demo
<script setup>
import { ref } from 'vue'

const value = ref('flags-explorer')

const options = [
  { label: 'Figma Import', value: 'figma-import' },
  {
    type: 'group',
    label: 'Explorers',
    options: [
      { label: 'Flags Explorer', value: 'flags-explorer' },
      { label: 'File Explorer', value: 'file-explorer' },
    ],
  },
]
</script>

<template>
  <PList v-model="value" class="w-64" :options="options" />
</template>
```

## Disabled and variants

Set `disabled` to skip an option while navigating, `variant` to color its text and background.

```vue demo
<script setup>
const options = [
  { label: 'Import Extension', value: 'import-extension' },
  { disabled: true, label: 'Manage Extensions', value: 'manage-extensions' },
  { label: 'Reset Token', value: 'reset-token', variant: 'warning' },
  { label: 'Delete Workspace', value: 'delete-workspace', variant: 'error' },
]
</script>

<template>
  <PList class="w-64" :options="options" />
</template>
```

## Custom item

The `item` slot replaces the content of an option.

```vue demo
<script setup>
const options = [
  { label: 'Figma Import', value: 'figma-import' },
  { label: 'Manage Extensions', value: 'manage-extensions' },
]
</script>

<template>
  <PList class="w-64" :options="options">
    <template #item="{ item, index }">
      <strong>{{ item.label }}</strong>
      <span class="text-gray-600">#{{ index }}</span>
    </template>
  </PList>
</template>
```

## Empty

```vue demo
<script setup>
const options = []
</script>

<template>
  <PList class="w-64" :options="options">
    <template #empty>No results found.</template>
  </PList>
</template>
```

## Loading

Set `loading` to cover the list with a loading mask, the `empty` slot stays hidden and selection is
disabled until it is set back to `false`.

```vue demo
<script setup>
import { ref } from 'vue'

const loading = ref(true)
const options = []
</script>

<template>
  <PStack align="center">
    <PList class="w-64" :loading="loading" :options="options">
      <template #empty>No results found.</template>
    </PList>

    <PButton size="sm" @click="loading = !loading"> Toggle </PButton>
  </PStack>
</template>
```

## Virtual

Set `virtual` to render only the visible rows, `item-size` is the estimated row height in pixels.

```vue demo
<script setup>
const options = Array.from({ length: 1000 }, (_, index) => ({
  label: `Extension ${index + 1}`,
  value: `extension-${index + 1}`,
}))
</script>

<template>
  <PList
    class="w-64 max-h-40"
    virtual
    :item-size="36"
    :over-scan="8"
    :options="options"
  />
</template>
```

## Keyboard navigation

The list does not listen to the keyboard by itself, map the keys to the `dispatch` method through
the template `ref`.

```vue demo
<script setup>
import { ref } from 'vue'

const list = ref()
const value = ref('import-extension')

const keymap = {
  ArrowDown: 'next',
  ArrowUp: 'previous',
  End: 'last',
  Enter: 'activate',
  Home: 'first',
}

const options = [
  { label: 'Figma Import', value: 'figma-import' },
  { label: 'Import Extension', value: 'import-extension' },
  { label: 'Manage Extensions', value: 'manage-extensions' },
  { label: 'Flags Explorer', value: 'flags-explorer' },
]

function onKeydown(ev) {
  const command = keymap[ev.key]

  if (command && list.value?.dispatch(command)) {
    ev.preventDefault()
  }
}
</script>

<template>
  <PStack align="center">
    <PList ref="list" v-model="value" class="w-64" :options="options" @keydown="onKeydown" />

    <PButton size="sm" @click="list?.focus()"> Focus </PButton>
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `ListModelValue` | - | Selected value, an array when `multiple` is set |
| options | `ListOptions` | `() => []` | Options and `group` entries to render |
| item-class | `ComponentClass` | - | Class merged into every internally rendered list item |
| loading | `boolean` | - | Cover the list with a loading mask, hide the `empty` slot and block selection |
| multiple | `boolean` | - | Let several options be selected at the same time |
| default-active-index | `number` | `-1` | Option active before the user navigates |
| loop | `boolean` | `true` | Wrap keyboard navigation around both ends |
| virtual | `boolean` | `false` | Enable virtualized rendering for large option sets |
| item-size | `number` | `36` | Estimated row height in px when `virtual` is enabled |
| over-scan | `number` | `4` | Extra rows rendered outside the viewport when `virtual` is enabled |

Any other key of an option is forwarded to its root element, so `href`, `to` or `target` work
as expected.

### ListOption

| Name | Type | Description |
| --- | --- | --- |
| value | `string \| number` | Value written to the model when the option is selected |
| label | `string \| number \| null` | Text of the option |
| description | `string` | Second line below the label |
| variant | `'default' \| 'error' \| 'warning'` | Text and background colors of the option |
| disabled | `boolean` | Ignore clicks and skip the option while navigating |
| as | `string \| object` | Element or component rendered as the option root |
| keywords | `string[]` | Extra terms matched by the filter of `PCommandMenu` |

### ListOptionGroup

| Name | Type | Description |
| --- | --- | --- |
| type | `'group'` | Marks the entry as a group |
| label | `string` | Text of the group header |
| options | `ListOption[]` | Options rendered under the header |

## ListItem Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| value | `string \| number` | - | Value written to the model when the item is selected |
| label | `string \| number \| null` | - | Text of the item |
| description | `string` | - | Second line below the label |
| variant | `'default' \| 'error' \| 'warning'` | `'default'` | Text and background colors of the item |
| disabled | `boolean` | `false` | Ignore clicks and skip the item while navigating |
| as | `string \| object` | `'div'` | Element or component rendered as the item root |
| index | `number` | - | Navigable index inside the parent list |
| active | `boolean` | `false` | Whether the item is the keyboard or pointer active one |

## ListGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| label | `string` | - | Text of the group header, also used as its accessible name |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(option: ListOptionSelected) => void` | Emitted when an option is selected. |
| update:modelValue | `(value: ListModelValue) => void` | Emitted when the selection changes. |

`change` carries the selected option without `as` and `keywords`:

```ts
interface ListOptionSelected {
  label?: string | number
  value: string | number
  disabled?: boolean
  variant?: 'default' | 'error' | 'warning'
  description?: string
}
```

## ListItem Events

| Name | Type | Description |
| --- | --- | --- |
| click | `(value: string \| number, ev: MouseEvent) => void` | Emitted when the item is clicked. |

## Slots

| Name | Description |
| --- | --- |
| item | Item content: `{ item, index, group, groupIndex }` |
| empty | Enable when there is no data to display |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| focus | `() => void` | Focus the list container. |
| dispatch | `(command: ListNavigationCommand) => boolean` | Run a navigation command, returns `false` when it cannot be applied or `loading` is set. |
| setActiveIndex | `(index: number) => void` | Make the option at the given navigable index active. |
| setFirstAsActive | `() => void` | Make the first enabled option active. |
| activeIndex | `number` | Navigable index of the active option, `-1` when none is active. |

```ts
type ListNavigationCommand =
  | 'first'
  | 'last'
  | 'next'
  | 'previous'
  | 'activate'
  | 'enter-child'
  | 'leave-parent'
```

`PList` handles `first`, `last`, `next`, `previous` and `activate`, while `enter-child` and
`leave-parent` are provided by the components that embed the list, such as `PMenu`.
