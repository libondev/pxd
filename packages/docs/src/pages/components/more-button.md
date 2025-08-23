# More Button
Styling component to show expanded or collapsed content.

## Default
Based on the `button` component, props owns all buttons.

```vue demo
<script setup>
import { ref } from 'vue'

const expanded = ref(false)
</script>

<template>
  <PMoreButton v-model="expanded" />
  <PMoreButton v-model="expanded" variant="primary" />
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
