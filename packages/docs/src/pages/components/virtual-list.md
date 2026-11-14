# Virtual List

Display unlimited data lists and maintain page performance

## Fixed height items

```vue demo
<script setup>
const items = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
}))
</script>

<template>
  <PVirtualList
    class="!h-32 w-100 max-w-full border border-dashed rounded-lg"
    :items="items"
    data-key="id"
    :item-size="40"
  >
    <template #item="{ item }">
      <div class="px-4 h-10 py-2">
        {{ item.name }}
      </div>
    </template>
  </PVirtualList>
</template>
```

## Dynamic height items

Set an approximate height for each item.

```vue demo
<script setup>
const items = Array.from({ length: 100 }, (_, i) => ({
  key: i,
  name: `Item ${i}`,
  height: Math.random() * 100 + 40,
}))
</script>

<template>
  <PVirtualList
    class="!h-32 w-100 max-w-full border border-dashed rounded-lg"
    :items="items"
    data-key="key"
    :item-size="40"
  >
    <template #item="{ item }">
      <div class="px-4 py-2" :style="{ height: `${item.height}px` }">
        {{ item.name }}
      </div>
    </template>
  </PVirtualList>
</template>
```

## Masonry layout

Set **`column-count`** for column count and **`column-gap`** for spacing.

```vue demo
<script setup>
const items = Array.from({ length: 50 }, (_, i) => ({
  id: i,
  title: `Card ${i}`,
  height: Math.floor(Math.random() * 120) + 72,
}))
</script>

<template>
  <PVirtualList
    class="!h-64 w-100 max-w-full rounded-lg"
    :items="items"
    :column-count="3"
    :column-gap="12"
    :item-size="80"
  >
    <template #item="{ item }">
      <div
        class="rounded-lg border bg-gray-100 px-3 py-2 text-sm"
        :style="{ height: `${item.height}px` }"
      >
        {{ item.title }}
      </div>
    </template>
  </PVirtualList>
</template>
```

## Infinite scroll

Use the `status` parameter together with the `on-bottom` callback and the `retry` event to achieve infinite scrolling of data loading

```vue demo
<script setup>
import { ref, onMounted } from 'vue'

const items = ref([])
const listStatus = ref() // 'loading' | 'finished' | 'error'

async function onBottom() {
  const startIdx = items.value.length

  if (startIdx >= 100) {
    listStatus.value = 'finished'
    return
  }

  listStatus.value = 'loading'

  // mock async request
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.25) {
        listStatus.value = 'error'
      }

      resolve()
    }, 500)
  })

  if (listStatus.value === 'error') {
    return
  }

  items.value.push(
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `Item ${startIdx + i}`,
    }))
  )

  listStatus.value = ''
}

function onRetry() {
  listStatus.value = ''
  onBottom()
}

onMounted(() => {
  onBottom()
})
</script>

<template>
  <PVirtualList
    class="!h-32 w-100 max-w-full border border-dashed rounded-lg"
    data-key="id"
    :item-size="40"
    :status="listStatus"
    :items="items"
    @retry="onRetry"
    @bottom="onBottom"
  >
    <template #item="{ item }">
      <div class="px-4 h-10 py-2">
        {{ item.name }}
      </div>
    </template>
  </PVirtualList>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `readonly any[]` | `() => []` | Rows to render; each row is passed to the `item` slot |
| data-key | `string` | `'id'` | Field of an item used as its stable key |
| item-size | `number \| ((index: number) => number)` | `50` | Row height in px, or a function returning it per index |
| status | `'loading' \| 'finished' \| 'error' \| ''` | `''` | Renders a message row under the list and, for `error`, makes it clickable |
| enabled | `boolean` | `true` | When `false`, nothing is rendered and `totalSize` stays `0` |
| over-scan | `number` | `2` | Extra rows rendered outside the viewport |
| column-gap | `number` | `0` | Horizontal gap between masonry columns, in px |
| column-count | `number` | `1` | Masonry column count; `1` renders a plain vertical list |
| scroll-padding-start | `number` | - | Space before the first row, in px |
| scroll-padding-end | `number` | - | Space after the last row, in px |
| on-bottom | `() => void \| Promise<void>` | - | Called when the last row enters the bottom threshold; the way to load more |
| bottom-threshold | `number` | `item-size` | Distance from the bottom that triggers `on-bottom`, in px |
| on-geometry-change | `() => void` | - | Called once a frame after the container geometry settles, for hosts that size the list |
| list-class | `ComponentClass` | - | Extra class on the inner content wrapper |
| item-class | `ComponentClass` | - | Extra class on every item wrapper |
| error-text | `ComponentText` | `'Request failed. Click to reload'` | Message shown while `status` is `error` |
| loading-text | `ComponentText` | `'Loading...'` | Message shown while `status` is `loading` |
| finished-text | `ComponentText` | `'Finished'` | Message shown while `status` is `finished` |

## Events

| Name | Type | Description |
| --- | --- | --- |
| retry | `() => void` | Emitted when the message row is clicked while `status` is `error`. |

Reaching the bottom is reported through the `on-bottom` prop, not an event.

## Slots

| Name | Description |
| --- | --- |
| item | item slot |
| message | message slot |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| totalSize | `number` | Total scrollable size of the list in pixels, `0` while the list is disabled. |
| virtualItems | `VirtualListItem[]` | Items the virtualizer currently renders, empty while the list is disabled. |
| getVirtualizer | `() => Virtualizer<HTMLElement, HTMLElement>` | Get the underlying TanStack virtualizer instance. |
| scrollSource | `VirtualListScrollSource` | Position and scroll source for `PToc`'s data-driven outline, tracking this list's cached offsets. |
| scrollToIndex | `(index: number, options?: ScrollToIndexOptions) => void` | Scroll to the item at the given index. |
| scrollToOffset | `(toOffset: number, options?: ScrollToOffsetOptions) => void` | Scroll to an absolute pixel offset. |
| scrollBy | `(delta: number, options?: ScrollToOffsetOptions) => void` | Scroll by a pixel delta. |
