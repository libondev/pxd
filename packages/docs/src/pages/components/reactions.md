# Reactions

Opens an emoji picker beside its content and keeps the reaction list in sync through `v-model`; the chips are rendered by the parent, through the methods exposed below.

## Default

The component inherits from popover and supports all the properties of popover. For details, See: [Popover](/components/popover).

```vue demo
<script setup>
import { ref, shallowRef } from 'vue'

const reactions = ref([
  { emoji: '👍', count: 3 },
  { emoji: '🚀', count: 1 },
])

const reactionsRef = shallowRef()

function onChip(emoji) {
  reactionsRef.value.toggle(emoji)
}
</script>

<template>
  <PReactions ref="reactionsRef" v-model="reactions">
    <div class="gap-1 flex flex-col items-start">
      <span class="px-3 py-2 rounded-lg bg-gray-100 text-sm">Shipped the new onboarding flow</span>

      <div data-popover-ignore class="gap-1 flex items-center">
        <button
          v-for="item in reactions"
          :key="item.emoji"
          type="button"
          :data-mine="item.mine || undefined"
          :aria-pressed="item.mine ? 'true' : 'false'"
          class="ps-1.5 pe-2 h-6 gap-1 text-xs inline-flex shrink-0 cursor-pointer appearance-none items-center rounded-full border bg-background-100 text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover data-[mine=true]:border-primary data-[mine=true]:bg-gray-200 data-[mine=true]:text-foreground motion-safe:transition-colors"
          @click="onChip(item.emoji)"
        >
          <span aria-hidden="true">{{ item.emoji }}</span>
          <span class="tabular-nums">{{ item.count }}</span>
        </button>
      </div>
    </div>
  </PReactions>
</template>
```

## Incoming reaction

```vue demo
<script setup>
import { ref, shallowRef } from 'vue'

const reactions = ref([{ emoji: '🚀', count: 1, mine: true }])
const reactionsRef = shallowRef()

const others = ['👍', '🎉', '👀', '❤️']
let step = 0

function onChip(emoji) {
  reactionsRef.value.toggle(emoji)
}

function someoneReacts() {
  const emoji = others[step++ % others.length]
  const existing = reactions.value.find(item => item.emoji === emoji)

  reactions.value = existing
    ? reactions.value.map(item => (item.emoji === emoji ? { ...item, count: item.count + 1 } : item))
    : [...reactions.value, { emoji, count: 1 }]
}
</script>

<template>
  <div class="gap-1 flex flex-col items-start">
    <PReactions ref="reactionsRef" v-model="reactions">
      <span class="px-3 py-2 rounded-lg bg-gray-100 text-sm">Shipped the new onboarding flow</span>
    </PReactions>

    <div data-popover-ignore class="gap-1 flex items-center">
      <button
        v-for="item in reactions"
        :key="item.emoji"
        type="button"
        :data-mine="item.mine || undefined"
        :aria-pressed="item.mine ? 'true' : 'false'"
        class="ps-1.5 pe-2 h-6 gap-1 text-xs inline-flex shrink-0 cursor-pointer appearance-none items-center rounded-full border bg-background-100 text-foreground-secondary self-focus-ring outline-none hover:bg-background-hover data-[mine=true]:border-primary data-[mine=true]:bg-gray-200 data-[mine=true]:text-foreground motion-safe:transition-colors"
        @click="onChip(item.emoji)"
      >
        <span aria-hidden="true">{{ item.emoji }}</span>
        <span class="tabular-nums">{{ item.count }}</span>
      </button>
    </div>

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
| model-value | `Reaction[]` | `[]` | Current reactions, each with an `emoji`, a `count` and whether it is `mine` |
| emojis | `string[]` | `['👍', '❤️', '😂', '😮', '😢', '🙏']` | Emoji offered in the picker |
| trigger | `PopoverTrigger \| PopoverTrigger[]` | `'click'` | How the picker opens: `click`, `hover`, `contextmenu` or `manual` |
| position | `ComponentPosition` | `'top-start'` | Placement of the picker relative to the content |
| disabled | `boolean` | `false` | Disable the picker and make the exposed methods no-ops |

## Events

| Name | Type | Description |
| --- | --- | --- |
| add | `(emoji: string) => void` | Emitted when the reader adds their reaction. |
| remove | `(emoji: string) => void` | Emitted when the reader takes their reaction off. |
| change | `(reactions: Reaction[]) => void` | Emitted when the reaction list changes. |
| update:model-value | `(reactions: Reaction[]) => void` | Emitted when the reaction list changes. |

## Slots

| Name | Description |
| --- | --- |
| default | Content the picker is anchored to. Mark the parts that handle their own clicks with `data-popover-ignore`. |

## Methods

| Name | Type | Description |
| --- | --- | --- |
| pick | `(emoji: string) => void` | Add the emoji and close the picker. |
| toggle | `(emoji: string) => void` | Add the emoji, or take the reader off it when it is already theirs. |
