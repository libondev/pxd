# Stick To Bottom

Keep a scroll container pinned to the bottom while content updates, until the user scrolls away. Scrolling back to the bottom restores auto-follow.

## Default

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const items = ref(['Item 1', 'Item 2', 'Item 3'])

function append() {
  items.value.push(`Item ${items.value.length + 1}`)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <PButton @click="append">Add item</PButton>

    <PStickToBottom class="h-40 rounded-lg border border-dashed" wrapper-class="p-2">
      <div v-for="item in items" :key="item" class="p-2 rounded bg-background-100">
        {{ item }}
      </div>
    </PStickToBottom>
  </div>
</template>
```

## Disabled auto-follow

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const items = ref(['Log 1'])

function append() {
  items.value.push(`Log ${items.value.length + 1}`)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <PButton @click="append">Append log</PButton>

    <PStickToBottom disabled class="h-36 rounded-lg border border-dashed" wrapper-class="p-2">
      <div v-for="item in items" :key="item" class="py-1">
        {{ item }}
      </div>
    </PStickToBottom>
  </div>
</template>
```

## Fader

Set `fader` to show a gradient at the scrollable edges.

```vue demo
<script setup lang="ts">
import { ref } from 'vue'

const items = ref(Array.from({ length: 20 }, (_, index) => `Item ${index + 1}`))
</script>

<template>
  <PStickToBottom fader class="h-40 rounded-lg border border-dashed" wrapper-class="p-2">
    <div v-for="item in items" :key="item" class="p-2 rounded bg-background-100">
      {{ item }}
    </div>
  </PStickToBottom>
</template>
```

## Interaction keeps the position

A resize the user causes — expanding a collapse, selecting text — never pulls the view to the bottom: while the layout that interaction started is still moving, the viewport belongs to it. Pointerdowns inside the `action` slot are excluded, so controls there keep following.

```vue demo
<script setup lang="ts">
import ArrowUpIcon from '@gdsicon/vue/arrow-up'
</script>

<template>
  <PStickToBottom class="relative h-56 rounded-lg border border-dashed" wrapper-class="p-2">
    <PCollapseGroup multiple>
      <PCollapse v-for="i in 8" :key="i" :heading="`Panel ${i}`">
        <div class="mb-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet, cupiditate magnam? Quae
          alias debitis beatae nesciunt veniam excepturi soluta magnam vitae.
        </div>
      </PCollapse>
    </PCollapseGroup>

    <template #action="{ isAtBottom, forceStickToBottom }">
      <PButton
        v-if="!isAtBottom"
        class="mx-auto flex"
        size="sm" shape="rounded" icon-only
        @click="forceStickToBottom"
      >
        <ArrowUpIcon class="rotate-180" />
      </PButton>
    </template>
  </PStickToBottom>
</template>
```

## Scroll to bottom action

Use the `action` slot with `PBacktop` to jump back to the bottom after the user scrolls away. The slot exposes `isAtBottom`, `scrollToBottom`, and `forceStickToBottom`.

```vue demo
<script setup lang="ts">
import { ref } from 'vue'
import ArrowUpIcon from '@gdsicon/vue/arrow-up'

const items = ref(Array.from({ length: 12 }, (_, i) => `Message ${i + 1}`))

function append() {
  items.value.push(`Message ${items.value.length + 1}`)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <PButton @click="append">Send message</PButton>

    <PStickToBottom class="relative h-40 rounded-lg border border-dashed" wrapper-class="p-2">
      <div v-for="item in items" :key="item" class="p-2 rounded bg-background-100">
        {{ item }}
      </div>

      <template #action="{ isAtBottom, forceStickToBottom }">
        <PButton
          v-if="!isAtBottom"
          class="mx-auto flex"
          size="sm" shape="rounded" icon-only
          @click="forceStickToBottom"
        >
          <ArrowUpIcon class="rotate-180" />
        </PButton>
      </template>
    </PStickToBottom>
  </div>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| threshold | `number` | `16` | Distance from bottom considered "at bottom" |
| fader | `boolean` | `false` | Show gradient faders at the scrollable edges, hidden within `threshold` of an edge |
| fader-dimension | `number` | - | Fader gradient length in `px`, defaulting to `24` |
| fader-color | `string` | - | Fader gradient color, any CSS color value |
| fader-direction | `'horizontal' \| 'vertical' \| 'both'` | - | Edges to fade: `horizontal`, `vertical` or `both` |
| disabled | `boolean` | `false` | Stop auto-scrolling while the container is at the bottom |
| content-class | `ComponentClass` | - | Extra class on the inner content wrapper |
| wrapper-class | `ComponentClass` | - | Extra class on the scroll container; the wrapper receives `class` and attributes |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(isAtBottom: boolean, details: ChangeDetails) => void` | Emitted when the at-bottom state changes. |

## Slots

| Name | Description |
| --- | --- |
| default | Scrollable content. |
| action | Overlay action area rendered outside the scroll container. Slot props: `{ container, isAtBottom, scrollToBottom, forceStickToBottom }`; `container` is the scroll element. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| containerRef | `HTMLElement` | Scroll container element exposed for external scroll APIs. |
| contentRef | `HTMLElement` | Inner content wrapper element exposed for external measurement. |
| isAtBottom | `boolean` | Whether the container is currently within the bottom threshold. |
| scrollToBottom | `() => void` | Scroll instantly to the bottom, leaving horizontal scroll untouched. |
| forceStickToBottom | `() => void` | Scroll to the bottom and re-enable auto-stick. |
| stickIfNeeded | `() => void` | Scroll to the bottom only while following and `disabled` is not true. |
| update | `() => void` | Re-measure whether the container is at the bottom. |
