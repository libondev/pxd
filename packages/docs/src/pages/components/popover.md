# Popover
A pop-up box with no style, used to show some information.

## Default

```vue demo
<script setup>
const content = 'The hymn of humanity is the hymn of courage.'
</script>

<template>
  <PStack justify="center" class="w-lg">
    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="top-start">
      <PButton>
        Top start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="top">
      <PButton>
        Top
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="top-end">
      <PButton>
        Top end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>

  <PStack justify="between" class="w-lg my-2">
    <PStack direction="vertical">
      <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="left-start">
        <PButton>
          Left start
        </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="left">
        <PButton>
          Left
        </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="left-end">
        <PButton>
          Left end
        </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>
    </PStack>

    <PStack direction="vertical" align="end">
      <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="right-start">
        <PButton>
          Right start
        </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="right">
        <PButton>
          Right
        </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>

      <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="right-end">
        <PButton>
          Right end
        </PButton>

        <template #content>
          {{ content }}
        </template>
      </PPopover>
    </PStack>
  </PStack>

  <PStack justify="center" class="w-lg">
    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="bottom-start">
      <PButton>
        Bottom start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="bottom">
      <PButton>
        Bottom
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" position="bottom-end">
      <PButton>
        Bottom end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>
</template>
```

## Trigger

```vue demo
<script setup>
import { ref } from 'vue'

const visible = ref(false)
const content = 'The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep'
</script>

<template>
  <PStack>
    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" trigger="hover">
      <PButton>
        Hover to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" trigger="click">
      <PButton>
        Click to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" trigger="focus">
      <PButton>
        Focus to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" trigger="contextmenu">
      <PButton>
        Contextmenu to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" :trigger="['hover', 'click', 'focus']">
      <PButton>
        Hover/Click/Focus to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" trigger="manual" :visible="visible">
      <PButton @click="visible = !visible">
        Manual to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>
</template>
```

## Offset

```vue demo
<script setup>
const content = 'Two roads diverged in a wood, and I — I took the one less traveled by, and that has made all the difference.'
</script>

<template>
  <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" :offset="30">
    <PButton>
      Hover to active
    </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>
```

## Max width

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover content-class="bg-gray-1000 rounded-md p-2 text-sm text-gray-100" :max-width="200">
    <PButton>
      Hover to active
    </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>
```
