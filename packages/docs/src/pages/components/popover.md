# Popover
A pop-up box with no style, used to show some information.

## Default

```vue demo
<script setup>
const content = 'Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all.'
</script>

<template>
  <PStack gap="2">
    <PPopover content-class="popover-demo" position="top-start">
      <PButton>
        Top start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="top">
      <PButton>
        Top
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="top-end">
      <PButton>
        Top end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>

  <PStack gap="2" class="mt-2">
    <PPopover content-class="popover-demo" position="bottom-start">
      <PButton>
        Bottom start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="bottom">
      <PButton>
        Bottom
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="bottom-end">
      <PButton>
        Bottom end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>

  <PStack gap="2" class="mt-2">
    <PPopover content-class="popover-demo" position="left-start">
      <PButton>
        Left start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="left">
      <PButton>
        Left
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="left-end">
      <PButton>
        Left end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>

  <PStack gap="2" class="mt-2">
    <PPopover content-class="popover-demo" position="right-start">
      <PButton>
        Right start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="right">
      <PButton>
        Right
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="right-end">
      <PButton>
        Right end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>
</template>

<style>
.popover-demo {
  background: var(--color-gray-1000);
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  color: var(--color-gray-100);
}
</style>
```

## Trigger

```vue demo
<script setup>
import { ref } from 'vue'

const visible = ref(false)
const content = 'The woods are lovely, dark and deep, but I have promises to keep, and miles to go before I sleep'
</script>

<template>
  <PStack gap="2">
    <PPopover content-class="popover-demo" trigger="hover">
      <PButton>
        Hover to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" trigger="click">
      <PButton>
        Click to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" trigger="focus">
      <PButton>
        Focus to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" trigger="contextmenu">
      <PButton>
        Contextmenu to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" :trigger="['hover', 'click', 'focus']">
      <PButton>
        Hover/Click/Focus to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" trigger="manual" :visible="visible">
      <PButton @click="visible = !visible">
        Manual to active
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>
</template>

<style>
.popover-demo {
  background: var(--color-gray-1000);
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  color: var(--color-gray-100);
}
</style>
```

## Offset

```vue demo
<script setup>
const content = 'Two roads diverged in a wood, and I — I took the one less traveled by, and that has made all the difference.'
</script>

<template>
  <PPopover content-class="popover-demo" :offset="30">
    <PButton>
      Hover to active
    </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>

<style>
.popover-demo {
  background: var(--color-gray-1000);
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  color: var(--color-gray-100);
}
</style>
```

## Max width

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover content-class="popover-demo" :max-width="200">
    <PButton>
      Hover to active
    </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>

<style>
.popover-demo {
  background: var(--color-gray-1000);
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  color: var(--color-gray-100);
}
</style>
```

## Enterable

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover content-class="popover-demo" enterable>
    <PButton>
      Hover to active
    </PButton>

    <template #content>
      {{ content }}
    </template>
  </PPopover>
</template>

<style>
.popover-demo {
  background: var(--color-gray-1000);
  border-radius: 8px;
  padding: 8px;
  font-size: 14px;
  color: var(--color-gray-100);
}
</style>
```
