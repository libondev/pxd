# Bubble

Show the conversation.

## Default

```vue demo
<template>
  <PBubble role="assistant">The Evil Rabbit Jumped over the Fence</PBubble>
  <PBubble role="user">The Evil Rabbit Jumped over the Fence</PBubble>
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
  <PBubble role="assistant" :loading="loading">The Evil Rabbit Jumped over the Fence</PBubble>
</template>
```

## Avatar

```vue demo
<template>
  <PBubble role="assistant" avatar="https://avatars.githubusercontent.com/u/47918504?s=48&v=4">The Evil Rabbit Jumped over the Fence</PBubble>
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
  <PBubble role="assistant" header="System">
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
