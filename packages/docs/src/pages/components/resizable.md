# Resizable

Two panels side by side, separated by a draggable divider that keeps their sizes as percentages of
the group.

## Default

`leading` and `trailing` are the two panels. In a horizontal group they are the left and the
right one; in a vertical group, the top and the bottom one.

```vue demo
<script setup>
import { ref } from 'vue'

const direction = ref('horizontal')
</script>

<template>
  <PStack direction="vertical">
    <PSwitch v-model="direction">
      <PSwitchItem value="horizontal">Row</PSwitchItem>
      <PSwitchItem value="vertical">Col</PSwitchItem>
    </PSwitch>

    <PResizable :direction="direction" class="w-100 h-50 max-w-full border rounded-lg">
      <template #leading>
        <div class="flex h-full items-center justify-center">Leading</div>
      </template>
      <template #trailing>
        <div class="flex h-full items-center justify-center">Trailing</div>
      </template>
    </PResizable>
  </PStack>
</template>
```

## Sizes

unit: %

The two panels always add up to 100, so there is only one number to keep: the size of the leading
panel. Pass `v-model` to hold it somewhere else, or `:default-value` to set where an uncontrolled
group starts. Leave both off and the group splits evenly.

Each panel slot receives its current `size`.

```vue demo
<script setup>
import { ref } from 'vue'

const sizes = ref([25, 75])
</script>

<template>
  <PStack direction="vertical" gap="3">
    <PStack align="center" gap="3">
      <PButton size="sm" @click="() => (sizes = [50, 50])">Reset</PButton>
      <PText secondary>{{ sizes.map((size) => size + '%').join(' / ') }}</PText>
    </PStack>

    <PResizable v-model="sizes" class="w-100 h-50 max-w-full border rounded-lg">
      <template #leading="{ size }">
        <div class="flex h-full items-center justify-center">Leading — {{ size }}%</div>
      </template>
      <template #trailing="{ size }">
        <div class="flex h-full items-center justify-center">Trailing — {{ size }}%</div>
      </template>
    </PResizable>
  </PStack>
</template>
```

The sizes are the caller's truth: a `model-value` that does not add up to 100, or that sits outside
`min-size`, is rendered as given and reported in development rather than silently rewritten.

## Bounds

`min-size` takes one floor per panel. Because the pair always sums to 100, a floor is at the same
time the other panel's ceiling: `[20, 40]` means leading 20-60 and trailing 40-80. Floors that add
up to more than 100 leave no split that fits, so they are ignored.

```vue demo
<template>
  <PResizable :default-value="[30, 70]" :min-size="[20, 40]" class="w-100 h-50 max-w-full border rounded-lg">
    <template #leading>
      <div class="flex h-full items-center justify-center">Leading — 20 to 60%</div>
    </template>
    <template #trailing>
      <div class="flex h-full items-center justify-center">Trailing — 40 to 80%</div>
    </template>
  </PResizable>
</template>
```

## Collapse

Double clicking folds the leading panel down to its `min-size` and hands the space to the trailing
panel; double clicking again gives the pair back the exact sizes it had, not the configured start.
Without a `min-size` the panel folds all the way to zero. Dragging a folded pair expands it, so it
is never a dead end.

`aria-valuetext` on the divider spells the fold out for screen readers, and `data-collapsed` is
there for styling.

```vue demo
<template>
  <PResizable :default-value="[30, 70]" :min-size="[15, 0]" class="w-100 h-50 max-w-full border rounded-lg">
    <template #leading>
      <div class="flex h-full items-center justify-center">Leading</div>
    </template>
    <template #trailing>
      <div class="flex h-full items-center justify-center">Trailing</div>
    </template>
  </PResizable>
</template>
```

## Grip

`handle` draws the grip in the middle of the divider. The divider itself is always there, because
it is what you drag.

```vue demo
<template>
  <PResizable handle :default-value="[40, 60]" class="w-100 h-50 max-w-full border rounded-lg">
    <template #leading>
      <div class="flex h-full items-center justify-center">Leading</div>
    </template>
    <template #trailing>
      <div class="flex h-full items-center justify-center">Trailing</div>
    </template>
  </PResizable>
</template>
```

## Disabled

`disabled` stops the divider from dragging and folding.

```vue demo
<template>
  <PResizable disabled :default-value="[30, 70]" class="w-100 h-50 max-w-full border rounded-lg">
    <template #leading>
      <div class="flex h-full items-center justify-center">Leading</div>
    </template>
    <template #trailing>
      <div class="flex h-full items-center justify-center">Trailing</div>
    </template>
  </PResizable>
</template>
```

## Nested

A group has exactly two panels, so a third one is a group nested inside a panel. Each group keeps
its own sizes.

```vue demo
<template>
  <PResizable :default-value="[30, 70]" class="w-100 h-100 max-w-full border rounded-lg">
    <template #leading>
      <div class="flex h-full items-center justify-center">Leading</div>
    </template>
    <template #trailing>
      <PResizable direction="vertical" handle class="border-t">
        <template #leading>
          <div class="flex h-full items-center justify-center">One</div>
        </template>
        <template #trailing>
          <div class="flex h-full items-center justify-center">Two</div>
        </template>
      </PResizable>
    </template>
  </PResizable>
</template>
```

## Keyboard

The divider is a focusable `separator`: arrow keys move it by 1%, holding shift by 10%, and
`Home` / `End` snap it to the ends of its range. Moving a folded pair brings it back, so a
keyboard user is never trapped behind a fold they cannot undo.

Double clicking folds the leading panel, see [Collapse](#collapse).

## Accessibility

The divider is a widget rather than a static line, and it is announced as one. It reports the
leading panel's position through `aria-valuenow`, the range it may travel through through
`aria-valuemin` and `aria-valuemax`, and both panels through `aria-controls`. `aria-valuetext`
spells the number out as a percentage and carries the fold state, which is the one field the
`separator` role leaves free-form.

`disabled` mirrors into `aria-disabled` and takes the divider out of the tab order.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| direction | `'horizontal' \| 'vertical'` | `horizontal` | Axis along which the two panels are laid out and resized |
| min-size | `number[]` | `[0, 0]` | Smallest allowed size of each panel as a percentage; each one is also the other panel's ceiling |
| handle | `boolean` | `false` | Draw the grip in the middle of the divider |
| disabled | `boolean` | `false` | Stop the divider from being dragged, moved or folded |
| default-value | `number[]` | `[50, 50]` | Sizes an uncontrolled group starts from; read once, on setup |
| model-value | `number[] \| null` | `null` | The two sizes as percentages, leading first; unset means the group keeps them itself |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(sizes: number[]) => void` | Emitted when a drag or a double click commits new panel sizes. |
| reset | `(sizes: number[]) => void` | Emitted when the panels are put back to the sizes the group started from. |
| update:modelValue | `(sizes: number[]) => void` | Emitted whenever a panel size changes. |

## Slots

| Name | Description |
| --- | --- |
| leading | The leading panel — left in a horizontal group, top in a vertical one. Slot props: `size`. |
| trailing | The trailing panel — right in a horizontal group, bottom in a vertical one. Slot props: `size`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| getPanelSizes | `() => number[]` | Read the current panel sizes as percentages, leading first. |
| reset | `() => void` | Restore the sizes the group started from and expand the pair if it is folded. |
