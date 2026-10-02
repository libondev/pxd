# Active Graph

Show the activity of users, and show different levels of brightness according to the level.

## Default

By default, the end date will be today, and the last Sunday of the previous year will be found as the start date.

```vue demo
<script setup>
import { ref } from 'vue'

function getRandomData(date, count) {
  const random = Math.floor(Math.random() * count)

  return {
    date: date.toISOString().split('T')[0],
    count: random,
  }
}

function genRandomData() {
  const today = new Date()

  const data = []

  for (let i = 0; i < 50; i++) {
    const day = Math.floor(Math.random() * 15)
    today.setDate(today.getDate() - day)
    data.push(getRandomData(today, 20))
  }

  return data
}

const data = ref(genRandomData())
const lastClickDate = ref('')

function refreshData() {
  data.value = genRandomData()
}

function onChange(date, event) {
  console.log({ date, event })
}
</script>

<template>
  <PStack direction="vertical">
    <PActiveGraph :data="data" @change="onChange" />

    <PButton class="ml-8" @click="refreshData()"> Refresh </PButton>
  </PStack>
</template>
```

## Transpose

```vue demo
<script setup>
const data = [
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
]
</script>

<template>
  <PActiveGraph transpose :data="data" start-date="2025-05-01" end-date="2025-05-31" />
</template>
```

## Select

```vue demo
<script setup>
const data = [
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
]
</script>

<template>
  <PActiveGraph transpose :data="data" default-select="2025-05-06" start-date="2025-05-01" end-date="2025-05-31" />
</template>
```

## Field Names

Custom data field.

```vue demo
<script setup>
const fieldNames = { date: 'created_at', count: 'value' }

const data = [
  { created_at: '2025-05-06', value: 5 },
  { created_at: '2025-05-07', value: 10 },
  { created_at: '2025-05-08', value: 15 },
  { created_at: '2025-05-09', value: 20 },
]
</script>

<template>
  <PActiveGraph
    transpose
    :data="data"
    :field-names="fieldNames"
    start-date="2025-05-01"
    end-date="2025-05-31"
  />
</template>
```

## Stylize

```vue demo
<script setup>
const data = [
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
  { date: '2025-05-10', count: 15 },
  { date: '2025-05-11', count: 20 },
  { date: '2025-05-12', count: 25 },
  { date: '2025-05-13', count: 27 },
  { date: '2025-05-14', count: 28 },
  { date: '2025-05-15', count: 30 },
  { date: '2025-05-19', count: 10 },
  { date: '2025-05-29', count: 5 },
]

const colors = {
  0: 'var(--color-gray-alpha-200)',
  5: 'var(--color-red-400)',
  10: 'var(--color-green-500)',
  15: 'var(--color-amber-600)',
  20: 'var(--color-blue-900)',
  // You can configure a higher level.
  25: '#A64500',
  27: '#07828B',
  28: '#8A0993',
}
</script>

<template>
  <PActiveGraph
    transpose
    :data="data"
    :colors="colors"
    item-radius="20"
    start-date="2025-05-01"
    end-date="2025-05-31"
  />
</template>
```

## Custom tooltip

```vue demo
<script setup>
const data = [
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
]
</script>

<template>
  <PStack direction="vertical" gap="12">
    <PActiveGraph transpose :data="data" start-date="2025-05-01" end-date="2025-05-31">
      <template #tooltip="{ data }"> {{ data.count }} contributions on {{ data.date }}. </template>
    </PActiveGraph>
  </PStack>
</template>
```

## Graph Only

```vue demo
<script setup>
const data = [
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
]
</script>

<template>
  <PStack direction="vertical" gap="12">
    <PActiveGraph
      graph-only
      :data="data"
      :legend="false"
      start-date="2025-05-01"
      end-date="2025-05-31"
    />

    <PActiveGraph
      transpose
      graph-only
      :data="data"
      :legend="false"
      start-date="2025-05-01"
      end-date="2025-05-31"
    />
  </PStack>
</template>
```

## No tooltip

```vue demo
<script setup>
const data = [
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
]
</script>

<template>
  <PActiveGraph
    transpose
    :data="data"
    :tooltip="false"
    start-date="2025-05-01"
    end-date="2025-05-31"
  />
</template>
```

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| data | `Record<string, any>[]` | `() => []` | Activity records; counts sharing a date are summed |
| legend | `boolean` | `true` | Render the `Less` / `More` color legend below the graph |
| colors | `Record<string, string>` | - | Map of count thresholds to colors; keys also drive the legend swatches |
| start-date | `string \| Date` | - | First date of the range, defaults to the Sunday closest to one year ago |
| end-date | `string \| Date` | - | Last date of the range, defaults to today |
| tooltip | `boolean` | `true` | Show a tooltip with the count when a cell is hovered |
| graph-only | `boolean` | - | Hide the header row and render only the cells |
| transpose | `boolean` | - | Swap the axes so dates run down rows and weekdays across columns |
| field-names | `FieldNames` | - | Data field names, e.g. `{ date: 'created_at', count: 'value' }` |
| item-radius | `string \| number` | - | Corner radius of each cell; a number is treated as `px` |
| default-select | `string` | - | Date pre-selected on mount, drawn with a primary border |

## Events

| Name | Type | Description |
| --- | --- | --- |
| change | `(date: string, event: MouseEvent) => void` | Emitted when a date cell is clicked. |

## Slots

| Name | Description |
| --- | --- |
| tooltip | tooltip slot |
