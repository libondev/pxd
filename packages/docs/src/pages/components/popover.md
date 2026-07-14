# Popover

A pop-up box with no style, used to show some information.

## Default

```vue demo
<script setup>
const content = 'The hymn of humanity is the hymn of courage.'
</script>

<template>
  <PStack justify="center" class="w-lg">
    <PPopover
      content-class="p-4 bg-background-100 shadow-sm border rounded-md"
      position="top-start"
    >
      <PButton> Top start </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" position="top">
      <PButton> Top </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" position="top-end">
      <PButton> Top end </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>

  <PStack justify="between" class="w-lg my-2">
    <PStack direction="vertical">
      <PPopover
        content-class="p-4 bg-background-100 shadow-sm border rounded-md"
        position="left-start"
      >
        <PButton> Left start </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" position="left">
        <PButton> Left </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover
        content-class="p-4 bg-background-100 shadow-sm border rounded-md"
        position="left-end"
      >
        <PButton> Left end </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>
    </PStack>

    <PStack direction="vertical" align="end">
      <PPopover
        content-class="p-4 bg-background-100 shadow-sm border rounded-md"
        position="right-start"
      >
        <PButton> Right start </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" position="right">
        <PButton> Right </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover
        content-class="p-4 bg-background-100 shadow-sm border rounded-md"
        position="right-end"
      >
        <PButton> Right end </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>
    </PStack>
  </PStack>

  <PStack justify="center" class="w-lg">
    <PPopover
      content-class="p-4 bg-background-100 shadow-sm border rounded-md"
      position="bottom-start"
    >
      <PButton> Bottom start </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" position="bottom">
      <PButton> Bottom </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover
      content-class="p-4 bg-background-100 shadow-sm border rounded-md"
      position="bottom-end"
    >
      <PButton> Bottom end </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>
</template>
```

## Trigger Methods

```vue demo
<script setup>
import { ref } from 'vue'

const visible = ref(false)
const content =
  'The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep'
</script>

<template>
  <PStack>
    <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" trigger="hover">
      <PButton> Hover to active </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" trigger="click">
      <PButton> Click to active </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover
      content-class="p-4 bg-background-100 shadow-sm border rounded-md"
      trigger="contextmenu"
    >
      <PButton> Contextmenu to active </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover
      content-class="p-4 bg-background-100 shadow-sm border rounded-md"
      :trigger="['hover', 'click']"
    >
      <PButton> Hover/Click to active </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover
      v-model="visible"
      trigger="manual"
      content-class="p-4 bg-background-100 shadow-sm border rounded-md"
    >
      <PButton @click="visible = !visible"> Manual to active </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>
</template>
```

## Multiple trigger elements

Use `trigger-selector` when several DOM elements should share one popover instance. The popover keeps the same floating element open and updates its position to the active matched trigger.

```vue demo
<script setup>
const actions = [
  { key: 'bold', label: 'B', description: 'Make selected text bold.' },
  { key: 'italic', label: 'I', description: 'Make selected text italic.' },
  { key: 'underline', label: 'U', description: 'Underline selected text.' },
]
</script>

<template>
  <PPopover
    trigger="hover"
    trigger-selector="[data-popover-trigger]"
    content-class="p-3 bg-background-100 shadow-sm border rounded-md text-sm"
  >
    <PStack>
      <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        data-popover-trigger
        :data-popover-key="action.key"
        :data-popover-description="action.description"
        class="h-8 w-8 rounded-md border bg-background-100 font-medium"
      >
        {{ action.label }}
      </button>
    </PStack>

    <template #content="{ activeTrigger, activeTriggerIndex }">
      {{ activeTrigger.dataset.popoverDescription + activeTriggerIndex }}
    </template>
  </PPopover>
</template>
```

`trigger-selector` matches the final DOM elements inside the default slot. When using it on a Vue component, make sure the component forwards the matching attribute or class to a real DOM element. The `activeTrigger` slot prop is the matched DOM element, not the Vue component instance.

## Align to point

Set `align-point` to position the Popover at the pointer position. With `hover`, the Popover follows the pointer while it is inside the trigger. With `click`, it toggles at the clicked point. With `contextmenu`, each right-click updates the position and a click hides the Popover.

```vue demo
<script setup>
import { ref } from 'vue'

const content = 'The Popover follows the pointer position.'
const trigger = ref('hover')

const toggleButtonOptions = [
  { label: 'Hover', value: 'hover' },
  { label: 'Click', value: 'click' },
  { label: 'Context Menu', value: 'contextmenu' },
]
</script>

<template>
  <PStack direction="vertical" align="start" class="w-full gap-3">
    <PToggleButtonGroup v-model="trigger" size="sm" variant="outline" :multiple="false" :options="toggleButtonOptions" />

    <PPopover
      align-point
      :trigger="trigger"
      class="w-full"
      :interactive="false"
      content-class="p-3 bg-background-100 shadow-sm border rounded-md text-sm"
    >
      <div class="flex h-48 w-full items-center justify-center rounded-md border border-dashed text-sm">
        Move, click, or right-click in this area
      </div>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>
</template>
```

## Offset

```vue demo
<script setup>
const content =
  'Two roads diverged in a wood, and I — I took the one less traveled by, and that has made all the difference.'
</script>

<template>
  <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" :offset="30">
    <PButton> Hover to active </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>
```

## Max width

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover content-class="p-4 bg-background-100 shadow-sm border rounded-md" :max-width="200">
    <PButton> Hover to active </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>
```

## closeOnPressEscape

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover close-on-press-escape content-class="p-4 bg-background-100 shadow-sm border rounded-md" :max-width="200">
    <PButton> Hover to active </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| z-index | `number \| string` | - | - |
| offset | `number` | - | - |
| trigger | `'click' \| 'hover' \| 'contextmenu' \| 'manual' \| 'click' \| 'hover' \| 'contextmenu' \| 'manual'[]` | `() => ['hover']` | - |
| trigger-selector | `string` | - | Selector for multiple DOM triggers inside the default slot. |
| align-point | `boolean` | - | Align the Popover to the pointer position. |
| disabled | `boolean` | - | - |
| adaptive | `boolean` | - | - |
| max-width | `number \| string` | - | - |
| position | `'top' \| 'right' \| 'bottom' \| 'left' \| ...` | `bottom` | - |
| show-delay | `number` | `0` | - |
| hide-delay | `number` | `0` | - |
| show-arrow | `boolean` | - | - |
| arrow-color | `string` | - | - |
| model-value | `boolean` | - | - |
| interactive | `boolean` | `true` | - |
| auto-position | `boolean` | `true` | - |
| wrapper-class | `string \| any[] \| object` | - | - |
| content-class | `string \| any[] \| object` | - | - |
| content-style | `CSSProperties \| string` | - | - |
| toggle-on-trigger | `boolean` | `true` | - |
| close-on-invisible | `boolean` | `true` | - |
| close-on-press-escape | `boolean` | `true` | - |
| lock-scroll-on-visible | `boolean` | - | - |

## Slots

| Name | Description |
| --- | --- |
| default | Trigger content |
| content | Popover content. Slot props: `activeTrigger: HTMLElement \| null`, `activeTriggerIndex: number`. |
