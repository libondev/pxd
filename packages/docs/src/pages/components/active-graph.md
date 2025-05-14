# ActiveGraph
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

  for (let i = 0; i < 30; i++) {
    const day = Math.floor(Math.random() * 20)
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

function onCellClick(event, date) {
  console.log({ date })
}
</script>

<template>
  <PStack direction="col">
    <PActiveGraph :data="data" @cell-click="onCellClick" />

    <PButton class="ml-8" @click="refreshData()">
      Refresh
    </PButton>
  </PStack>
</template>
```

## Custom Colors and Date

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
];

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
    :data="data"
    :colors="colors"
    start-date="2025-05-01"
    end-date="2025-05-31"
  />
</template>
```
