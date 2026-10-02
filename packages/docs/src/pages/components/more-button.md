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
| more-text | `string` | `Show More` | Label rendered while the content is collapsed |
| less-text | `string` | `Show Less` | Label rendered while the content is expanded |
| model-value | `boolean` | `false` | Expanded state, toggled on every click |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(value: boolean) => void` | Emitted when the button toggles the expanded state. |
| update:modelValue | `(value: boolean) => void` | Emitted with the new expanded state on every toggle. |
