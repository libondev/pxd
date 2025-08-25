# Popover
A pop-up box with no style, used to show some information.

## Default

```vue demo
<script setup>
const content = 'Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all.'
</script>

<template>
  <PStack gap="2">
    <PPopover content-class="popover-demo" position="left">
      <PButton>
        left
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="top">
      <PButton>
        top
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="bottom">
      <PButton>
        bottom
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="right">
      <PButton>
        right
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>

  <PStack class="mt-2" gap="2">
    <PPopover content-class="popover-demo" position="top-start">
      <PButton>
        top-start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="top-end">
      <PButton>
        top-end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="bottom-start">
      <PButton>
        bottom-start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="bottom-end">
      <PButton>
        bottom-end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>
  </PStack>

  <PStack class="mt-2" gap="2">
    <PPopover content-class="popover-demo" position="left-start">
      <PButton>
        left-start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="left-end">
      <PButton>
        left-end
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="right-start">
      <PButton>
        right-start
      </PButton>

      <template #content>
        {{ content }}
      </template>
    </PPopover>

    <PPopover content-class="popover-demo" position="right-end">
      <PButton>
        right-end
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

## Destroy delay
-> For the sake of performance optimization, elements will not be destroyed immediately after popover hiding, which is to avoid the performance overhead caused by repeated rendering of hiding when frequently triggered, but this may not need to be considered in some cases.

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover content-class="popover-demo" :destroy-delay="0">
    <PButton>
      0ms(Immediately destroy)
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
