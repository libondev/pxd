# Reactions

Shows the emoji reactions under a message and lets the reader add their own or take it off again.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const reactions = ref([
  { emoji: '👍', count: 3 },
  { emoji: '🚀', count: 1 },
])
</script>

<template>
  <PReactions v-model="reactions">
    <span class="px-3 py-2 rounded-lg bg-gray-100 text-sm">Shipped the new onboarding flow</span>
  </PReactions>
</template>
```

## Incoming reaction

```vue demo
<script setup>
import { ref } from 'vue'

const reactions = ref([{ emoji: '🚀', count: 1, mine: true }])

const others = ['👍', '🎉', '👀', '❤️']
let step = 0

function someoneReacts() {
  const emoji = others[step++ % others.length]
  const existing = reactions.value.find(item => item.emoji === emoji)

  reactions.value = existing
    ? reactions.value.map(item => (item.emoji === emoji ? { ...item, count: item.count + 1 } : item))
    : [...reactions.value, { emoji, count: 1 }]
}
</script>

<template>
  <div class="gap-2 flex flex-col items-start">
    <PReactions v-model="reactions">
      <span class="px-3 py-2 rounded-lg bg-gray-100 text-sm">Shipped the new onboarding flow</span>
    </PReactions>

    <PButton size="sm" variant="ghost" @click="someoneReacts">Someone else reacts</PButton>
  </div>
</template>
```

## Custom emoji

```vue demo
<script setup>
import { ref } from 'vue'

const reactions = ref([])

const emojis = ['❤️', '🧡', '💛', '💚', '💙', '💜']
</script>

<template>
  <PReactions v-model="reactions" :emojis="emojis">
    <span class="px-3 py-2 rounded-lg bg-gray-100 text-sm">Love it</span>
  </PReactions>
</template>
```

## Hover trigger

```vue demo
<script setup>
import { ref } from 'vue'

const reactions = ref([{ emoji: '🔥', count: 2, mine: true }])
</script>

<template>
  <PReactions v-model="reactions" trigger="hover">
    <span class="px-3 py-2 rounded-lg bg-gray-100 text-sm">Hover me to react</span>
  </PReactions>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| model-value | `Reaction[]` | `[]` | Reactions shown under the message, each with an `emoji`, a `count` and whether it is `mine` |
| emojis | `string[]` | `['👍', '❤️', '😂', '😮', '😢', '🙏']` | Emoji offered in the picker |
| trigger | `PopoverTrigger \| PopoverTrigger[]` | `'click'` | How the picker opens: `click`, `hover`, `contextmenu` or `manual` |
| position | `ComponentPosition` | `'top'` | Placement of the picker relative to the message |
| disabled | `boolean` | `false` | Disable the picker and the reaction chips |

## Events

| Name | Type | Description |
| --- | --- | --- |
| add | `(emoji: string) => void` | Emitted when the reader adds their reaction, either from the picker or by pressing a chip they were not in. |
| remove | `(emoji: string) => void` | Emitted when the reader takes their reaction off a chip. |
| change | `(reactions: Reaction[]) => void` | Emitted when the reaction list changes. |
| update:modelValue | `(reactions: Reaction[]) => void` | Emitted when the reaction list changes. |

## Slots

| Name | Description |
| --- | --- |
| default | The message the reactions belong to, which also opens the picker. |
