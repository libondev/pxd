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
    <PSwitchGroup v-model="size" gap="5" :options="sizes" />

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

## Locale

```vue demo
<script setup>
import { ref } from 'vue'
import { zhCN, enUS } from 'pxd/locales'

const locale = ref('enUS')

const sizes = [
  { label: 'EnUS', value: 'enUS' },
  { label: 'ZhCN', value: 'zhCN' },
]

const locales = {
  zhCN,
  enUS,
}
</script>

<template>
  <PStack direction="col" gap="4">
    <PSwitchGroup v-model="locale" gap="5" :options="sizes" />

    <PConfigProvider :locale="locales[locale]">
      <PStack direction="col">
        <PActiveGraph start-date="2025-01-01" end-date="2025-01-31" />
      </PStack>
    </PConfigProvider>
  </PStack>
</template>
```
