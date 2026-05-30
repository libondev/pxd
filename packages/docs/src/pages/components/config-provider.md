# Config Provider

Config Provider is used for providing global configurations,

## Default

```vue demo
<script setup>
import { ref } from 'vue'

const size = ref('md')

const sizes = [
  { label: 'Small', value: 'sm' },
  { label: 'Medium', value: 'md' },
  { label: 'Large', value: 'lg' },
]
</script>

<template>
  <PSwitch v-model="size" :options="sizes" />

  <PConfigProvider :size="size" class="mt-4 max-w-xs">
    <PStack direction="vertical">
      <PToggle />
      <PBadge>Badge</PBadge>
      <PButton>Button</PButton>
      <PInput placeholder="Input" />
      <PTextarea placeholder="Textarea" />
    </PStack>
  </PConfigProvider>
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
  <PConfigProvider :locale="locales[locale]">
    <PStack direction="vertical">
      <PSwitch v-model="locale" :options="sizes" />
      <PActiveGraph start-date="2025-01-01" end-date="2025-01-31" />
    </PStack>
  </PConfigProvider>
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| size | `'sm' \| 'md' \| 'lg'` | `md` | - |
| locale | `Record<string, any>` | `() => enUS` | - |
| popover-show-transition | `boolean` | `true` | - |

## Slots

| Name | Description |
| --- | --- |
| default | Default slot |
