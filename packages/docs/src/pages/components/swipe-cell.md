# Swipe Cell

Swipeable container for exposing contextual actions on the left or right side.

## Default

Configure the `suffix` slot to enable left swipe.

```vue demo
<template>
  <PSwipeCell class="border">
    <div class="h-10 px-3 flex items-center bg-background text-sm">
      Swipe left to show actions
    </div>

    <template #suffix>
      <button class="h-full px-4 bg-red-900 text-sm text-white">
        Delete
      </button>
    </template>
  </PSwipeCell>
</template>
```

## Prefix and Suffix

The cell only allows swiping toward the side that has a configured slot.

```vue demo
<template>
  <PSwipeCell class="border">
    <div class="h-10 px-3 flex items-center bg-background text-sm">
      Swipe right to complete, swipe left to delete
    </div>

    <template #prefix>
      <button class="h-full px-4 bg-green-900 text-sm text-white">
        Done
      </button>
    </template>

    <template #suffix>
      <button class="h-full px-4 bg-red-900 text-sm text-white">
        Delete
      </button>
    </template>
  </PSwipeCell>
</template>
```

## Controlled

Use `v-model` to control the open side.

```vue demo
<script setup>
import { ref } from 'vue'

const open = ref(false)
</script>

<template>
  <PStack direction="vertical">
    <PSwipeCell v-model="open" class="border">
      <div class="h-10 px-3 flex items-center bg-background text-sm">
        Current open side: {{ open || 'closed' }}
      </div>

      <template #prefix>
        <button class="h-full px-4 bg-green-900 text-sm text-white">
          Done
        </button>
      </template>

      <template #suffix>
        <button class="h-full px-4 bg-red-900 text-sm text-white">
          Delete
        </button>
      </template>
    </PSwipeCell>

    <PStack>
      <PButton size="sm" @click="open = 'prefix'">Open prefix</PButton>
      <PButton size="sm" @click="open = 'suffix'">Open suffix</PButton>
      <PButton size="sm" @click="open = false">Close</PButton>
    </PStack>
  </PStack>
</template>
```

## Over Swipe

Use `over-swipe-threshold` and the `over-swipe` event to trigger a default action when the release distance is far beyond the action slot width. The event is only emitted after the gesture ends. Set `close-on-over-swipe` to clear the swipe state after the event is emitted.

```vue demo
<script setup>
import { ref } from 'vue'
import { useMessage } from 'pxd'

const message = ref('Over-swipe')

function onOverSwipe(event) {
  console.log('Over swipe event:', event)
  useMessage.success('Over swiped', { group: 'website' })
}
</script>

<template>
  <PStack direction="vertical">
    <PSwipeCell
      class="border"
      :over-swipe-threshold="1.8"
      close-on-over-swipe
      @over-swipe="onOverSwipe"
    >
      <div class="h-10 px-3 flex items-center bg-background text-sm">
        {{ message }}
      </div>

      <template #prefix="{ overSwipe }">
        <div class="relative flex h-full">
          <div class="flex h-full">
            <button class="h-full px-4 bg-green-800 text-sm text-white">
              Done
            </button>
            <button class="h-full px-4 bg-blue-800 text-sm text-white">
              Later
            </button>
          </div>

          <div
            class="inset-0 absolute flex h-full items-center bg-green-900 px-4 text-sm text-white transition-opacity"
            :class="overSwipe ? 'opacity-100' : 'pointer-events-none opacity-0'"
          >
            Done
          </div>
        </div>
      </template>

      <template #suffix="{ overSwipe }">
        <div class="relative flex h-full">
          <div class="flex h-full">
            <button class="h-full px-4 bg-amber-800 text-sm text-white">
              Mark
            </button>
            <button class="h-full px-4 bg-red-800 text-sm text-white">
              Delete
            </button>
          </div>

          <div
            class="inset-0 absolute flex h-full items-center justify-end bg-red-900 px-4 text-sm text-white transition-opacity"
            :class="overSwipe ? 'opacity-100' : 'pointer-events-none opacity-0'"
          >
            Delete
          </div>
        </div>
      </template>
    </PSwipeCell>
  </PStack>
</template>
```

## Before Close

Use `before-close` to control whether the cell can close. The callback receives the close trigger: `left`, `right`, `content`, or `outside`.

```vue demo
<script setup>
import { ref } from 'vue'

const locked = ref(true)

async function beforeClose() {
  return !locked.value
}
</script>

<template>
  <PStack direction="vertical">
    <PSwipeCell
      class="border"
      model-value="suffix"
      :before-close="beforeClose"
    >
      <div class="h-10 px-3 flex items-center bg-background text-sm">
        Turn off locked before closing
      </div>

      <template #suffix>
        <button class="h-full px-4 bg-red-900 text-sm text-white">
          Delete
        </button>
      </template>
    </PSwipeCell>

    <PToggle v-model="locked" active-label="Locked" inactive-label="Unlocked" />
  </PStack>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| as | `string \| object` | `div` | - |
| disabled | `boolean` | - | Disable swipe gestures. |
| model-value | `'prefix' \| 'suffix' \| false` | `false` | Controlled open side. |
| threshold | `number` | `0.5` | Minimum ratio of action slot width needed to keep the cell open after release. |
| over-swipe-threshold | `number` | `1.5` | Ratio of action slot width needed to emit `over-swipe`. |
| close-on-over-swipe | `boolean` | `false` | Close the cell after `over-swipe` is emitted. |
| close-on-click | `boolean` | `true` | Close the cell when clicking the content while it is open. |
| before-close | `(trigger: 'left' \| 'right' \| 'content' \| 'outside') => boolean \| PromiseLike<boolean>` | - | Return `false` to prevent the cell from closing. |
| root-class | `ComponentClass` | - | Class applied to the root element. |
| content-class | `ComponentClass` | - | Class applied to the content element. |
| prefix-class | `ComponentClass` | - | Class applied to the prefix action wrapper. |
| suffix-class | `ComponentClass` | - | Class applied to the suffix action wrapper. |

## Events

| Name | Type | Description |
| --- | --- | --- |
| open | `(side: 'prefix' \| 'suffix') => void` | Emitted when the cell opens. |
| close | `() => void` | Emitted when the cell closes. |
| over-swipe | `(state: SwipeCellOverSwipeState) => void` | Emitted after release when the final drag distance reaches the over-swipe threshold. |
| update:modelValue | `(side: 'prefix' \| 'suffix' \| false) => void` | Emitted when the open state changes. |

## Slots

| Name | Description |
| --- | --- |
| default | Cell content. |
| prefix | Left action area. Enables right swipe when configured. Slot props: `side`, `active`, `distance`, `progress`, `overSwipe`. |
| suffix | Right action area. Enables left swipe when configured. Slot props: `side`, `active`, `distance`, `progress`, `overSwipe`. |
