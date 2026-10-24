# Confirm Popover

A popover that asks for a second confirmation before running an action. The trigger is whatever you put in the default slot, and the popover opens above it with a confirm and a cancel button.

## Default

```vue demo
<script setup>
function handleConfirm() {
  console.log('confirmed')
}
</script>

<template>
  <PConfirmPopover
    title="Delete this file?"
    description="This action cannot be undone."
    @confirm="handleConfirm"
  >
    <PButton variant="error">Delete</PButton>
  </PConfirmPopover>
</template>
```

## Destructive

```vue demo
<template>
  <PConfirmPopover
    title="Delete 12 items?"
    description="Every selected item will be removed."
    confirm-variant="error"
    confirm-text="Delete"
    cancel-text="Keep"
  >
    <PButton variant="error">Delete selected</PButton>
  </PConfirmPopover>
</template>
```

## Async confirmation

Pass `before-confirm` to run an async task while the confirm button stays in its loading state. Returning `false` or rejecting keeps the popover open.

```vue demo
<script setup>
async function deleteItem() {
  await new Promise((resolve) => setTimeout(resolve, 800))
}

function handleConfirm() {
  console.log('deleted')
}
</script>

<template>
  <PConfirmPopover
    title="Delete this file?"
    :before-confirm="deleteItem"
    @confirm="handleConfirm"
  >
    <PButton>Delete</PButton>
  </PConfirmPopover>
</template>
```

## Custom actions

Replace the buttons with the `actions` slot — for example a hold button that only confirms after a long press.

```vue demo
<template>
  <PConfirmPopover title="Hold to delete">
    <PButton variant="error">Delete</PButton>

    <template #actions="{ confirm }">
      <PHoldButton size="sm" variant="error" @confirm="confirm">Hold to delete</PHoldButton>
    </template>
  </PConfirmPopover>
</template>
```

## Multiple triggers

`trigger-selector` lets any number of DOM elements share one confirm popover, so a list or tree can render a single instance. The popover follows the matched trigger, and the `content` / `actions` slots receive the active one — switching triggers while a `before-confirm` is still pending discards that confirm.

```vue demo
<template>
  <PConfirmPopover trigger-selector="[data-confirm-file]">
    <PStack direction="vertical" align="start" class="w-full gap-1">
      <button
        v-for="file in ['report.pdf', 'photo.png', 'notes.md']"
        :key="file"
        type="button"
        data-confirm-file
        :data-file="file"
        class="h-8 w-full rounded-md border px-2 text-start text-sm bg-background-100"
      >
        {{ file }}
      </button>
    </PStack>

    <template #content="{ activeTrigger }">
      <div class="p-3 flex max-w-64 flex-col gap-2">
        <p class="m-0 text-sm font-medium">Delete {{ activeTrigger?.dataset.file }}?</p>
        <p class="m-0 text-[13px] text-foreground-secondary">This action cannot be undone.</p>
      </div>
    </template>

    <template #actions="{ confirm, cancel, pending }">
      <div class="gap-1.5 flex items-center justify-end">
        <PButton size="sm" variant="ghost" :disabled="pending" @click="cancel">
          Cancel
        </PButton>

        <PButton size="sm" variant="error" :loading="pending" @click="confirm">
          Delete
        </PButton>
      </div>
    </template>
  </PConfirmPopover>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `boolean` | - | Controlled visibility; omit it to let the component track visibility on its own |
| title | `string` | - | Title rendered above the description, also used as the dialog label |
| description | `string` | - | Secondary line rendered between the title and the actions |
| confirm-text | `string` | - | Label of the confirm button, defaulting to `locale.interaction.confirm` |
| cancel-text | `string` | - | Label of the cancel button, defaulting to `locale.interaction.cancel` |
| confirm-variant | `'default' \| 'primary' \| 'error' \| 'warning' \| 'success' \| 'ghost' \| 'simple' \| 'link'` | `primary` | Variant of the confirm button |
| position | `'top' \| 'right' \| 'bottom' \| 'left' \| ...` | `top` | Preferred placement, flipped when there is no room; `-start` and `-end` align to the edge |
| disabled | `boolean` | - | Ignore every trigger event so the popover cannot be shown |
| trigger-selector | `string` | - | Selector for multiple DOM triggers inside the default slot; every matched element shares this popover |
| before-confirm | `() => Awaitable<boolean \| void>` | - | Ran before confirming; return `false` or reject to keep the popover open |

## Events

| Name | Type | Description |
| --- | --- | --- |
| confirm | `() => void` | Emitted after `before-confirm` settles without returning `false`. |
| cancel | `() => void` | Emitted when the cancel button is clicked. |
| update:model-value | `(visible: boolean) => void` | Emitted when the visibility changes. |

## Slots

| Name | Description |
| --- | --- |
| default | Trigger content. |
| content | Replaces the whole popover body. Slot props: `confirm: () => void`, `cancel: () => void`, `pending: boolean`, `activeTrigger: HTMLElement \| null`, `activeTriggerIndex: number`. |
| actions | Replaces only the buttons. Slot props: `confirm: () => void`, `cancel: () => void`, `pending: boolean`, `activeTrigger: HTMLElement \| null`, `activeTriggerIndex: number`. |
