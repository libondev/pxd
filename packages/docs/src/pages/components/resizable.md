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

    <PResizable v-model="sizes" class="w-100 h-50 max-w-full text-sm border rounded-lg">
      <template #leading="{ size }">
        <div class="flex h-full items-center justify-center">{{ size }}%</div>
      </template>
      <template #trailing="{ size }">
        <div class="flex h-full items-center justify-center">{{ size }}%</div>
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
  <PResizable unit="px" :default-value="[240]" :min-size="[120, 0]" class="w-full h-50 border rounded-lg text-sm">
    <template #leading="{ size }">
      <div class="flex h-full items-center justify-center">{{ size }}px</div>
    </template>
    <template #trailing>
      <div class="flex h-full items-center justify-center">the rest</div>
    </template>
  </PResizable>
</template>
```

## Bounds

`min-size` floors each panel in `unit`; because the pair fills the group, each floor is also the
other panel's ceiling. Floors that cannot fit are ignored.

```vue demo
<template>
  <PResizable :default-value="[30, 70]" :min-size="[20, 40]" class="w-100 h-50 max-w-full border rounded-lg text-sm">
    <template #leading>
      <div class="flex h-full items-center justify-center">20 to 60%</div>
    </template>
    <template #trailing>
      <div class="flex h-full items-center justify-center">40 to 80%</div>
    </template>
  </PResizable>
</template>
```

## Collapse

Dragging stops at `min-size`; another half of it past that folds the panel to 0, and coming back
past the same point unfolds it — all inside the gesture, committed on release. `collapsed` makes
the fold controllable.

```vue demo
<script setup>
import { ref } from 'vue'

const sizes = ref([256, 744])
const collapsed = ref(false)
</script>

<template>
  <PStack direction="vertical" gap="3">
    <PStack align="center" gap="3">
      <PButton size="sm" @click="() => (collapsed = !collapsed)">Toggle</PButton>
      <PText secondary>{{ collapsed ? 'Folded' : `${sizes[0]}px` }}</PText>
    </PStack>

    <PResizable
      v-model="sizes"
      v-model:collapsed="collapsed"
      unit="px"
      :min-size="[180, 0]"
      :default-value="[256, 0]"
      class="w-full h-50 border rounded-lg"
    >
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

Double click resets the leading panel to `default-value`, clamped into the bounds, and unfolds it;
`dblclick-action="fold"` folds instead. A panel with no `min-size` floor has nothing to fold past,
so dragging it just stops at 0.

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

`disabled` stops dragging, keyboard resizing, resetting and folding.

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

## Three columns

Nesting a `reverse` group in the trailing slot gives the VS Code split: the left and right columns
keep their px size, the middle takes the rest, and either divider takes width from the middle.
A fold past `min-size[1] / 2` hides the right column instead.

```vue demo
<script setup>
import { ref } from 'vue'

const left = ref([96, 0])
const right = ref([0, 120])
</script>

<template>
  <PResizable v-model="left" unit="px" :min-size="[80, 220]" :default-value="[96, 0]" class="w-100 h-50 max-w-full border rounded-lg">
    <template #leading>
      <div class="flex h-full items-center justify-center">Left</div>
    </template>
    <template #trailing>
      <PResizable v-model="right" reverse unit="px" :min-size="[120, 100]" :default-value="[0, 120]">
        <template #leading>
          <div class="flex h-full items-center justify-center">Middle</div>
        </template>
        <template #trailing>
          <div class="flex h-full items-center justify-center">Right</div>
        </template>
      </PResizable>
    </template>
  </PResizable>
</template>
```

## Keyboard

The divider is focusable: arrow keys along the group's axis move it by one step (ten with shift),
and `Home` / `End` snap to the bounds. A folded pair is out of the tab order, so unfolding it has
to come from the app through `collapsed`.

## Accessibility

The divider is a focusable `separator` that reports the leading position and range through
`aria-valuenow`, `aria-valuemin` and `aria-valuemax`, and links both panels with `aria-controls`;
`aria-valuetext` adds the unit. A panel squeezed to 0 is `inert`, so nothing inside it is
focusable or reachable by AT. `disabled` maps to `aria-disabled`. A disabled or folded divider
leaves the tab order, and a folded one drops the value range with it — the app's own trigger is
what has to carry the fold state, e.g. through `aria-expanded`.

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| direction | `'horizontal' \| 'vertical'` | `horizontal` | Axis along which the two panels are laid out and resized |
| unit | `'percent' \| 'px'` | `percent` | Unit every size is written in; `percent` shares the container between both panels, `px` pins the leading panel and gives the rest to the trailing one |
| reverse | `boolean` | `false` | Under `px`, pin the trailing panel and give the rest to the leading one |
| min-size | `number[]` | `[0, 0]` | Smallest allowed size of each panel, in `unit`; each one is also the other panel's ceiling |
| collapsed | `boolean \| null` | `null` | Fold the leading panel to 0; unset means the group keeps the flag itself |
| dblclick-action | `'reset' \| 'fold'` | `reset` | What a double click on the divider does |
| handle | `boolean` | `false` | Draw the grip in the middle of the divider |
| disabled | `boolean` | `false` | Stop the divider from being dragged, moved, reset or folded |
| default-value | `number[]` | `[50, 50]` | Sizes an uncontrolled group starts from and the target of a double click, in `unit`; under `px` only the pinned size is read |
| model-value | `number[] \| null` | `null` | The two sizes in `unit`, leading first; under `px` only the pinned size is read — the leading one, or the trailing one with `reverse` — and unset means the group keeps them itself |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(sizes: number[]) => void` | Emitted when a drag, a key press or a fold commits new panel sizes. |
| reset | `(sizes: number[]) => void` | Emitted when the panels go back to `default-value`. |
| update:collapsed | `(collapsed: boolean) => void` | Emitted when the leading panel folds or unfolds. |
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
| reset | `() => void` | Restore `default-value` and unfold the pair. |
