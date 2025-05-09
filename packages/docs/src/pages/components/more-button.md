# MoreButton
Styling component to show expanded or collapsed content.

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

<template>
  <PMoreButton v-model="expanded" />
  <PMoreButton v-model="expanded" :button-props="{variant:'primary'}" />
</template>
```

## Texts
You can modify the button text by setting `lessText` and `moreText`.

```vue demo
<script setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

<template>
  <PMoreButton
    v-model="expanded"
    more-text="moreee"
    less-text="lessss"
  />
</template>
```
