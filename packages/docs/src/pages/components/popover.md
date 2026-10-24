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
    <PStack direction="vertical" class="w-auto">
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

    <PStack direction="vertical" align="end" class="w-auto">
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

## Multiple trigger

Use `trigger-selector` when several DOM elements should share one popover instance. The popover keeps the same floating element open and updates its position to the active matched trigger.

Trigger clicks are read in the capture phase, so an inner `@click.stop` still reaches the popover: use it to keep a clickable row from reacting without disabling the trigger. Mark a subtree with `data-popover-ignore` when its events should not reach the popover at all. A popover nested inside another one's trigger area owns its own events.

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
    <div class="flex">
      <button
        v-for="action in actions"
        :key="action.key"
        type="button"
        data-popover-trigger
        :data-popover-key="action.key"
        :data-popover-description="action.description"
        class="h-8 w-8 -ms-px border bg-background-100 font-medium first:ms-0 first:rounded-s-md last:rounded-e-md"
      >
        {{ action.label }}
      </button>
    </div>

    <template #content="{ activeTrigger, activeTriggerIndex }">
      {{ activeTrigger.dataset.popoverDescription + activeTriggerIndex }}
    </template>
  </PPopover>
</template>
```

## Align to point

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

## Nested popovers

The nearest popover owns the trigger event. Clicking the small button opens its own popover and closes the row one, so two contents are never shown at once, and no manual stop is needed.

```vue demo
<script setup>
const rows = [
  { key: 'inbox', label: 'Inbox', detail: '12 unread messages' },
  { key: 'drafts', label: 'Drafts', detail: '3 unsent drafts' },
]
</script>

<template>
  <PPopover
    trigger="click"
    trigger-selector="[data-row]"
    content-class="p-3 bg-background-100 shadow-sm border rounded-md text-sm"
  >
    <PStack direction="vertical" class="w-64 gap-1">
      <div
        v-for="row in rows"
        :key="row.key"
        data-row
        :data-detail="row.detail"
        class="h-9 pe-1 ps-2 flex items-center justify-between rounded-md border cursor-pointer"
      >
        {{ row.label }}

        <PPopover trigger="click" content-class="p-2 bg-background-100 shadow-sm border rounded-md text-sm">
          <PButton size="sm" variant="ghost"> Actions </PButton>

          <template #content> Actions for {{ row.label }} </template>
        </PPopover>
      </div>
    </PStack>

    <template #content="{ activeTrigger }">
      {{ activeTrigger?.dataset.detail }}
    </template>
  </PPopover>
</template>
```

## Ignored trigger areas

Every chip matches `trigger-selector`, but the second one carries `data-popover-ignore`: events inside it are never treated as a trigger, for any trigger method. A popover that is already open stays open until the pointer leaves it.

```vue demo
<script setup>
const chips = [
  { key: 'inbox', label: 'Inbox', description: '12 unread messages' },
  { key: 'drafts', label: 'Drafts', description: '3 unsent drafts', ignored: true },
  { key: 'sent', label: 'Sent', description: 'Everything delivered' },
]
</script>

<template>
  <PPopover
    trigger="hover"
    trigger-selector="[data-chip]"
    content-class="p-3 bg-background-100 shadow-sm border rounded-md text-sm"
  >
    <PStack class="w-64 gap-1">
      <button
        v-for="chip in chips"
        :key="chip.key"
        type="button"
        data-chip
        :data-description="chip.description"
        :data-popover-ignore="chip.ignored ? '' : undefined"
        class="h-8 px-2 rounded-md border bg-background-100 text-sm"
      >
        {{ chip.label }}
      </button>
    </PStack>

    <template #content="{ activeTrigger }">
      {{ activeTrigger?.dataset.description }}
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
| aria-labelledby | `string` | - | ID of the element that labels the Popover dialog |
| content-class | `string \| any[] \| object` | - | Class bound to the Popover content |
| content-style | `CSSProperties \| string` | - | Inline style bound to the Popover content |
| toggle-on-trigger | `boolean` | `true` | Hide the Popover when the trigger is activated again |
| auto-focus-element | `string \| boolean` | `false` | Focus the first tabbable element on open, or the one matching a selector |
| return-focus-on-deactivate | `boolean` | `true` | Return focus to the trigger when the Popover closes |
| close-on-invisible | `boolean` | `true` | Hide the Popover when the trigger is clipped or scrolled out of view |
| close-on-outside-click | `boolean` | `true` | Close the Popover when the pointer is pressed outside of it and its trigger |
| close-on-press-escape | `boolean` | `true` | Close the Popover when pressing `Escape` |
| lock-scroll-on-visible | `boolean` | - | Currently unused: the overlay is bound to `adaptive` instead, so scroll locks only in adaptive mode |

## Events

| Name | Type | Description |
| --- | --- | --- |
| show | `() => void` | Emitted when the popover becomes visible. |
| hide | `() => void` | Emitted when the popover becomes hidden. |
| escape | `(event: KeyboardEvent) => void` | Emitted when `Escape` is pressed while the popover is open, before it hides. |
| outside-click | `(event: PointerEvent) => void` | Emitted when the pointer is pressed outside both the trigger and the popover while it is open. Judged by where the press starts, so a drag that begins inside and releases outside does not count. |
| trigger-click | `(event: PointerEvent) => void` | Emitted when one of the resolved trigger elements is clicked. |
| visible-change | `(visible: boolean) => void` | Emitted when the visible state changes. |
| wrapper-keydown | `(event: KeyboardEvent) => void` | Emitted when a key is pressed inside the popover while it is open. |
| update:model-value | `(visible: boolean) => void` | Emitted right after `show` or `hide` with the new visibility. |

## Slots

| Name | Description |
| --- | --- |
| default | Trigger content |
| content | Popover content. Slot props: `activeTrigger: HTMLElement \| null`, `activeTriggerIndex: number`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| show | `() => Promise<void>` | Show the popover after the configured `show-delay`. |
| hide | `(immediate?: boolean) => Promise<void>` | Hide the popover, skipping the `hide-delay` when `immediate` is `true`. |
| update | `() => void` | Recompute the popover position on the next animation frame. |
