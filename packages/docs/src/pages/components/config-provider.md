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
  <PStack direction="vertical" gap="4">
    <PSwitchGroup v-model="size" gap="5" :options="sizes" />

    <PConfigProvider :size="size">
      <PStack direction="vertical">
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
// or only import enUS
// import enUS from 'pxd/locales/en-us'

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
  <PStack direction="vertical" gap="4">
    <PSwitchGroup v-model="locale" gap="5" :options="sizes" />

    <PConfigProvider :locale="locales[locale]">
      <PStack direction="vertical">
        <PActiveGraph start-date="2025-01-01" end-date="2025-01-31" />
      </PStack>
    </PConfigProvider>
  </PStack>
</template>
```
