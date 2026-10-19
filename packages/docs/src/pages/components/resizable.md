# Resizable

Two panels side by side, separated by a draggable divider that trades their sizes — as shares of the
group by default, or in pixels when `unit` is `px`.

## Default

`leading` and `trailing` are the two panels; `direction` lays them out as a row or a column.

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

Dragging only trades size between the panels. Use `v-model` to own the pair or `default-value` to
set where an uncontrolled group starts; each panel slot receives its size once a change settles.

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

A `model-value` is rendered as given, even when the pair does not add up to 100 or sits outside
`min-size`.

## Pixel sizes

`unit="px"` pins the leading panel and gives the rest of the container to the trailing one. Only
the leading size is read from `default-value` / `v-model`.

```vue demo
<template>
  <PResizable unit="px" :default-value="[240]" :min-size="[120, 0]" class="w-full h-50 border rounded-lg">
    <template #leading="{ size }">
      <div class="flex h-full items-center justify-center">Leading — {{ size }}px</div>
    </template>
    <template #trailing>
      <div class="flex h-full items-center justify-center">Trailing — the rest</div>
    </template>
  </PResizable>
</template>
```

## Bounds

`min-size` floors each panel in `unit`; because the pair fills the group, each floor is also the
other panel's ceiling. Floors that cannot fit are ignored.

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

Double click folds the leading panel to its `min-size`; double click again restores the previous
split. Dragging or pressing an arrow key expands a folded pair.

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

`handle` draws a grip on the divider.

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

`disabled` stops dragging, keyboard resizing and folding.

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

A group has two panels, so a third is a nested group with its own sizes.

```vue demo
<template>
  <PResizable :default-value="[30, 70]" class="w-100 h-100 max-w-full border rounded-lg">
    <template #leading>
      <div class="flex h-full items-center justify-center">Leading</div>
    </template>
    <template #trailing>
      <PResizable direction="vertical" handle>
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

The divider is focusable: arrow keys along the group's axis move it by one step (ten with shift),
and `Home` / `End` snap to the bounds. Moving a folded pair expands it.

## Accessibility

The divider is a focusable `separator` that reports the leading position and range through
`aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and links both panels with `aria-controls`.
`aria-valuetext` adds the unit and fold state; `disabled` maps to `aria-disabled` and removes the
divider from the tab order.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| direction | `'horizontal' \| 'vertical'` | `horizontal` | Axis along which the two panels are laid out and resized |
| unit | `'percent' \| 'px'` | `percent` | Unit every size is written in; `percent` shares the container between both panels, `px` pins the leading panel and gives the rest to the trailing one |
| min-size | `number[]` | `[0, 0]` | Smallest allowed size of each panel, in `unit`; each one is also the other panel's ceiling |
| handle | `boolean` | `false` | Draw the grip in the middle of the divider |
| disabled | `boolean` | `false` | Stop the divider from being dragged, moved or folded |
| default-value | `number[]` | `[50, 50]` | Sizes an uncontrolled group starts from, in `unit`; read once, on setup, and under `px` only the leading size |
| model-value | `number[] \| null` | `null` | The two sizes in `unit`, leading first; under `px` only the leading size is read, and unset means the group keeps them itself |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(sizes: number[]) => void` | Emitted when a drag, a key press or a double click commits new panel sizes. |
| reset | `(sizes: number[]) => void` | Emitted when the panels are put back to the sizes the group started from. |
| update:modelValue | `(sizes: number[]) => void` | Emitted whenever a panel size changes. |

## Slots

| Name | Description |
| --- | --- |
| leading | Leading panel. Slot props: `size` in `unit`, updated when a change settles. |
| trailing | Trailing panel. Slot props: `size` in `unit`, updated when a change settles. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| getPanelSizes | `() => number[]` | Read the current panel sizes in the group's `unit`, leading first. |
| reset | `() => void` | Restore the sizes the group started from and expand the pair if it is folded. |
