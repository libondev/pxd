# Popover
A pop-up box with no style, used to show some information.

## Default

```vue demo
<script setup>
const content = 'Hope is the thing with feathers that perches in the soul, and sings the tune without the words, and never stops at all.'
</script>

<template>
  <PStack gap="4">
    <PPopover position="left" :content="content">
      <PButton>
        left
      </PButton>
    </PPopover>

    <PPopover position="top" :content="content">
      <PButton>
        top
      </PButton>
    </PPopover>

    <PPopover position="bottom" :content="content">
      <PButton>
        bottom
      </PButton>
    </PPopover>

    <PPopover position="right" :content="content">
      <PButton>
        right
      </PButton>
    </PPopover>
  </PStack>

  <PStack gap="4" class="mt-4">
    <PPopover position="top-start" :content="content">
      <PButton>
        top-start
      </PButton>
    </PPopover>

    <PPopover position="top-end" :content="content">
      <PButton>
        top-end
      </PButton>
    </PPopover>

    <PPopover position="bottom-start" :content="content">
      <PButton>
        bottom-start
      </PButton>
    </PPopover>

    <PPopover position="bottom-end" :content="content">
      <PButton>
        bottom-end
      </PButton>
    </PPopover>
  </PStack>

  <PStack gap="4" class="mt-4">
    <PPopover position="left-start" :content="content">
      <PButton>
        left-start
      </PButton>
    </PPopover>

    <PPopover position="left-end" :content="content">
      <PButton>
        left-end
      </PButton>
    </PPopover>

    <PPopover position="right-start" :content="content">
      <PButton>
        right-start
      </PButton>
    </PPopover>

    <PPopover position="right-end" :content="content">
      <PButton>
        right-end
      </PButton>
    </PPopover>
  </PStack>
</template>

<style>
.pxd-popover__content {
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
  <PStack gap="4">
    <PPopover trigger="hover" :content="content">
      <PButton>
        Hover to active
      </PButton>
    </PPopover>

    <PPopover trigger="click" :content="content">
      <PButton>
        Click to active
      </PButton>
    </PPopover>

    <PPopover trigger="focus" :content="content">
      <PButton>
        Focus to active
      </PButton>
    </PPopover>

    <PPopover trigger="contextmenu" :content="content">
      <PButton>
        Contextmenu to active
      </PButton>
    </PPopover>

    <PPopover :trigger="['hover', 'click', 'focus']" :content="content">
      <PButton>
        Hover/Click/Focus to active
      </PButton>
    </PPopover>

    <PPopover trigger="manual" :visible="visible" :content="content">
      <PButton @click="visible = !visible">
        Manual to active
      </PButton>
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
  <PStack gap="4">
    <PPopover :content="content" :offset="30">
      <PButton>
        Hover to active
      </PButton>
    </PPopover>
  </PStack>
</template>
```

## No arrow

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover :content="content" :show-arrow="false">
    <PButton>
      Hover to active
    </PButton>
  </PPopover>
</template>
```

## Max width

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover :content="content" :max-width="200">
    <PButton>
      Hover to active
    </PButton>
  </PPopover>
</template>
```

## Enterable

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PPopover :content="content" enterable>
    <PButton>
      Hover to active
    </PButton>
  </PPopover>
</template>
```

## Transition offset

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PStack gap="4">
    <PPopover :content="content">
      <PButton>
        No translate
      </PButton>
    </PPopover>

    <PPopover :content="content" :translate-offset="10">
      <PButton>
        10px
      </PButton>
    </PPopover>

    <PPopover :content="content" :translate-offset="-10">
      <PButton>
        -10px(Reverse translate)
      </PButton>
    </PPopover>
  </PStack>
</template>
```

## Destroy delay
-> For the sake of performance optimization, elements will not be destroyed immediately after popover hiding, which is to avoid the performance overhead caused by repeated rendering of hiding when frequently triggered, but this may not need to be considered in some cases.

```vue demo
<script setup>
const content = 'Do not go gentle into that good night, rage, rage against the dying of the light.'
</script>

<template>
  <PStack gap="4">
    <PPopover :content="content" :destroy-delay="0">
      <PButton>
        0ms(Immediately destroy)
      </PButton>
    </PPopover>
  </PStack>
</template>
```
