# Bubble

Show the conversation.

## Default

```vue demo
<template>
  <PBubble role="system">The Evil Rabbit Jumped over the Fence</PBubble>
  <PBubble role="user">The Evil Rabbit Jumped over the Fence</PBubble>
</template>
```

## Variant

```vue demo
<template>
  <PBubble variant="ghost" role="system">The Evil Rabbit Jumped over the Fence</PBubble>
  <PBubble variant="ghost" role="user">The Evil Rabbit Jumped over the Fence</PBubble>
</template>
```

## Loading

```vue demo
<script setup>
import { ref } from 'vue'

const loading = ref(true)
</script>

<template>
  <PToggle v-model="loading" active-label="Loading" />
  <PBubble role="system" :loading="loading">The Evil Rabbit Jumped over the Fence</PBubble>
</template>
```

## Avatar

```vue demo
<template>
  <PBubble role="system" avatar="https://avatars.githubusercontent.com/u/47918504?s=48&v=4">The Evil Rabbit Jumped over the Fence</PBubble>
  <PBubble role="user" avatar="https://avatars.githubusercontent.com/u/47918504?s=48&v=4">The Evil Rabbit Jumped over the Fence</PBubble>
  <PBubble role="user" avatar="https://avatars.githubusercontent.com/u/47918504?s=48&v=4">The Evil Rabbit Jumped over the Fence</PBubble>
</template>
```

## Header/Footer

```vue demo
<script setup>
import RefreshClockwiseIcon from '@gdsicon/vue/refresh-clockwise'
import PencilEditIcon from '@gdsicon/vue/pencil-edit'
</script>

<template>
  <PBubble role="system" header="System">
    The Evil Rabbit Jumped over the Fence

    <template #footer>
      <PButton size="sm" variant="ghost" icon>
        <RefreshClockwiseIcon class="text-gray-900" />
      </PButton>
    </template>
  </PBubble>

  <PBubble role="user">
    The Evil Rabbit Jumped over the Fence

    <template #header>
      18:30:00
    </template>

    <template #footer>
      <PButton size="sm" variant="ghost" icon>
        <PencilEditIcon class="text-gray-900" />
      </PButton>
    </template>
  </PBubble>
</template>
```

## Group

By default, the `PBubbleGroup` component always shows the latest data at the bottom.

```vue demo
<script setup>
import { ref } from 'vue'

const messages = ref([
  { role: 'system', message: 'The Evil Rabbit Jumped over the Fence' },
  { role: 'user', message: 'The Evil Rabbit Jumped over the Fence' },
])

function addMessage() {
  messages.value.push({
    role: Math.random() > 0.5 ? 'system' : 'user',
    message: 'The Evil Rabbit Jumped over the Fence ' + Date.now(),
  })
}
</script>

<template>
  <PButton class="mb-2" @click="addMessage">Add Message</PButton>

  <PBubbleGroup class="max-h-40">
    <PBubble v-for="m of messages" :role="m.role" :text="m.message" />
  </PBubbleGroup>
</template>
```

## Group With Virtual Scroll

Pass `items` to enable virtual scrolling for large message lists.

```vue demo
<script setup>
import { ref } from 'vue'

const messages = ref(
  Array.from({ length: 50 }, (_, i) => ({
    id: i,
    role: i % 2 === 0 ? 'system' : 'user',
    message: `The Evil Rabbit Jumped over the Fence ${i}`,
  })),
)

function addMessage() {
  messages.value.push({
    id: messages.value.length,
    role: Math.random() > 0.5 ? 'system' : 'user',
    message: 'The Evil Rabbit Jumped over the Fence ' + Date.now(),
  })
}
</script>

<template>
  <PButton class="mb-2" @click="addMessage">Add Message</PButton>

  <PBubbleGroup class="max-h-80" :items="messages" data-key="id">
    <template #item="{ item }">
      <PBubble :role="item.role" :text="item.message" />
    </template>
  </PBubbleGroup>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| role | `'user' \| 'system' \| 'assistant'` | `system` | Message author, `user` is right-aligned, `system` and `assistant` are left-aligned |
| text | `string` | - | Message content rendered when the default slot is empty |
| header | `string` | - | Text shown above the bubble |
| avatar | `string` | - | Avatar image URL rendered before the bubble, the `avatar` slot overrides it |
| loading | `boolean` | - | Replace the message content with a spinner |
| variant | `default` \| `ghost` | `default` | Render a transparent bubble without border |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
| reactions | Reactions slot |

## BubbleGroup Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| items | `any[]` | - | Data array, enables virtual scrolling when provided |
| data-key | `string` | - | Unique key field name for list items |
| item-size | `number` | `80` | Estimated item height in pixels |
| over-scan | `number` | `3` | Number of items to render beyond the visible area |

## BubbleGroup Slots

| Name | Description |
| --- | --- |
| default | Default slot (used when `items` is not provided) |
| item | Scoped slot for virtual scroll mode: `{ item, index }` |
