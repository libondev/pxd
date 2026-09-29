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

## Fill trigger width

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover
    :fill-trigger-width="false"
    content-class="p-4 bg-background-100 shadow-sm border rounded-md"
    :max-width="200"
  >
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
| z-index | `number \| string` | - | Custom `z-index` for the Popover wrapper |
| offset | `number` | - | Gap in `px` between the Popover and its trigger |
| trigger | `'click' \| 'hover' \| 'contextmenu' \| 'manual' \| ('click' \| 'hover' \| 'contextmenu' \| 'manual')[]` | `() => ['hover']` | Trigger methods; takes one or an array of `hover`, `click`, `contextmenu`, `manual` |
| trigger-selector | `string` | - | Selector for multiple DOM triggers inside the default slot. |
| align-point | `boolean` | - | Align the Popover to the pointer position. |
| disabled | `boolean` | - | Ignore every trigger event so the Popover cannot be shown |
| adaptive | `boolean` | - | Render as a fullscreen overlay with dimmed backdrop, locked scroll and slide motion |
| max-width | `number \| string` | - | Max width of the content; a number is treated as `px` |
| fill-trigger-width | `boolean` | `true` | Match the Popover min width to the trigger width. |
| position | `'top' \| 'right' \| 'bottom' \| 'left' \| ...` | `bottom` | Preferred placement: `top`, `right`, `bottom` or `left`, each with optional `-start` / `-end` |
| show-delay | `number` | `0` | Delay in `ms` before the Popover is shown |
| hide-delay | `number` | `0` | Delay in `ms` before the Popover is hidden |
| destroy-delay | `number` | `3000` | Delay before unmounting content after hide. |
| show-arrow | `boolean` | - | Render the arrow pointing back to the trigger |
| arrow-color | `string` | - | Fill color of the arrow, any CSS color value |
| model-value | `boolean` | - | Controlled visibility, normally used with the `manual` trigger |
| interactive | `boolean` | `true` | Keep the Popover open while the pointer moves over it |
| auto-position | `boolean` | `true` | Reposition on scroll and resize, and flip when it would be clipped |
| wrapper-class | `string \| any[] \| object` | - | Class bound to the Popover wrapper |
| content-class | `string \| any[] \| object` | - | Class bound to the Popover content |
| content-style | `CSSProperties \| string` | - | Inline style bound to the Popover content |
| toggle-on-trigger | `boolean` | `true` | Hide the Popover when the trigger is activated again |
| auto-focus-element | `string \| boolean` | `false` | Focus the first tabbable element on open, or the one matching a selector |
| return-focus-on-deactivate | `boolean` | `true` | Return focus to the trigger when the Popover closes |
| close-on-invisible | `boolean` | `true` | Hide the Popover when the trigger is clipped or scrolled out of view |
| close-on-press-escape | `boolean` | `true` | Close the Popover when pressing `Escape` |
| lock-scroll-on-visible | `boolean` | - | Currently unused: the overlay is bound to `adaptive` instead, so scroll locks only in adaptive mode |

## Slots

| Name | Description |
| --- | --- |
| default | Trigger content |
| content | Popover content. Slot props: `activeTrigger: HTMLElement \| null`, `activeTriggerIndex: number`. |
