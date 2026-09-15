# Stick To Bottom

Keep a scroll container pinned to the bottom while content updates, until the user scrolls away. Scrolling back to the bottom restores auto-follow.

Auto-scroll is always **instant** — smooth scrolling is not supported, so continuous chat-style follow stays stable.

**Height required:** the container only scrolls when its height is constrained (for example `h-40`, or a flex child with `min-h-0`). Without that, it grows with content and never scrolls.

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

    <PStickToBottom class="h-40 rounded-lg border border-dashed p-2">
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

    <PStickToBottom :enabled="false" class="h-36 rounded-lg border border-dashed p-2">
      <div v-for="item in items" :key="item" class="py-1">
        {{ item }}
      </div>
    </PStickToBottom>
  </div>
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

    <PStickToBottom class="relative h-40 rounded-lg border border-dashed p-2">
      <div v-for="item in items" :key="item" class="p-2 rounded bg-background-100">
        {{ item }}
      </div>

      <template #action="{ isAtBottom, forceStickToBottom }">
        <PButton
          v-if="!isAtBottom"
          class="mx-auto flex"
          size="sm" shape="rounded" icon
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
| enabled | `boolean` | `true` | Whether updates auto-scroll while at bottom |
| content-class | `ComponentClass` | - | Extra class on the inner content wrapper |
| content-style | `CSSProperties \| string` | - | Extra style on the inner content wrapper |

## Emits

| Name | Payload | Description |
| --- | --- | --- |
| change | `[isAtBottom: boolean]` | Fired when at-bottom state changes |

## Slots

| Name | Props | Description |
| --- | --- | --- |
| default | - | Scrollable content |
| action | `{ isAtBottom, scrollToBottom, forceStickToBottom }` | Sticky action area for controls such as a jump-to-bottom button |

## Exposed

| Name | Type | Description |
| --- | --- | --- |
| containerEl | `HTMLElement` | Scroll container element (for virtual list / external scroll APIs) |
| isAtBottom | `boolean` | Whether the container is currently within the bottom threshold |
| scrollToBottom | `() => void` | Instantly scroll to bottom (Y axis only) |
| forceStickToBottom | `() => void` | Scroll to bottom and re-enable auto-stick |
| stickIfNeeded | `() => void` | Scroll to bottom only when currently at bottom and enabled |
| update | `() => void` | Re-measure whether the container is at the bottom |
