# Context Usage

A segmented bar that shows how an AI context window is filled.

## Default

```vue demo
<script setup>
const data = [
  { name: 'System tools', tokens: 6950 },
  { name: 'MCP tools', tokens: 1590 },
  { name: 'Skills', tokens: 510 },
  { name: 'System prompt', tokens: 440 },
  { name: 'Messages', tokens: 280 },
  { name: 'Other', tokens: 230 },
]
</script>

<template>
  <PContextUsage :total="200000" :data="data" />
</template>
```

## Near capacity

```vue demo
<script setup>
const data = [
  { name: 'System prompt', tokens: 4200 },
  { name: 'Tools', tokens: 36000 },
  { name: 'Messages', tokens: 147800 },
]
</script>

<template>
  <PContextUsage :total="200000" :data="data" />
</template>
```

## Sizes

```vue demo
<script setup>
const data = [
  { name: 'System prompt', tokens: 12000 },
  { name: 'Tools', tokens: 28000 },
  { name: 'Messages', tokens: 60000 },
]
</script>

<template>
  <PStack direction="vertical" gap="12">
    <PContextUsage :total="200000" :data="data" size="sm" :legend="false" />
    <PContextUsage :total="200000" :data="data" :legend="false" />
    <PContextUsage :total="200000" :data="data" size="lg" :legend="false" />
  </PStack>
</template>
```

## Without legend

```vue demo
<script setup>
const data = [
  { name: 'System prompt', tokens: 12000 },
  { name: 'Tools', tokens: 28000 },
  { name: 'Messages', tokens: 60000 },
]
</script>

<template>
  <PContextUsage :total="200000" :data="data" :legend="false" />
</template>
```

## Hover highlight

Hover a segment or a legend row: the matching pair stays at full strength while every other one dims.

```vue demo
<script setup>
const data = [
  { name: 'System prompt', tokens: 12000 },
  { name: 'Tools', tokens: 28000 },
  { name: 'Messages', tokens: 60000 },
]
</script>

<template>
  <PContextUsage :total="200000" :data="data" />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| total | `number` | - | Context window size in tokens, the denominator of the fill |
| data | `ContextUsageSegment[]` | - | Filled segments, sorted by `tokens` in descending order before rendering, rendered left to right as progressively lighter tints of the primary color and at least `1%` wide each, see `ContextUsageSegment` |
| size | `'sm' \| 'md' \| 'lg'` | - | Bar height, falls back to the config provider |
| legend | `boolean` | `true` | Show the legend list under the bar |

### ContextUsageSegment

| Name | Type | Description |
| --- | --- | --- |
| name | `string` | Legend label of the segment |
| tokens | `number` | Tokens the segment occupies; widths and legend percentages are derived from it, a non-empty segment never renders narrower than `1%` of the bar, the remaining window is the track |
