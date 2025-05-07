# ConfigProvider
Config Provider is used for providing global configurations,

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const size = ref('md')

const sizes = [
  { label: 'sm', value: 'sm' },
  { label: 'md', value: 'md' },
  { label: 'lg', value: 'lg' },
]
</script>

<template>
  <PStack direction="col" gap="4">
    <PRadioGroup v-model="size" gap="5" :options="sizes" />

    <PConfigProvider :size="size">
      <PStack direction="col">
        <PToggle />
        <PBadge>Badge</PBadge>
        <PButton>Button</PButton>
        <PInput placeholder="Input" />
        <PTextarea placeholder="Textarea" />
      </PStack>
    </PConfigProvider>
  </PStack>
</template>
```
