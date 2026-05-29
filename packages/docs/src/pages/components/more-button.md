# More Button

Styling component to show expanded or collapsed content.

## Default

MoreButton extends the [Button component](/components/button){class="font-medium underline"}.

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
  <PMoreButton v-model="expanded" more-text="moreee" less-text="lessss" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| more-text | `string` | `Show More` | - |
| less-text | `string` | `Show Less` | - |
| model-value | `boolean` | `false` | - |
