# ActiveGraph
Show the activity of users, and show different levels of brightness according to the level.

## Default

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

function genData() {
  const today = new Date()

  const data = []

  for (let i = 0; i < 30; i++) {
    const day = Math.floor(Math.random() * 20)
    today.setDate(today.getDate() - day)
    data.push(getRandomData(today, 20))
  }

  return data
}

const data = ref(genData())
</script>

<template>
  <PStack direction="col">
    <PButton @click="data = genData()">
      Refresh
    </PButton>

    <PActiveGraph :data="data" />
  </PStack>
</template>
```

## Custom Colors and Date

```vue demo
<script setup>
const colors = {
  0: 'var(--gray-alpha-200)',
  5: 'var(--color-red-400)',
  10: 'var(--color-green-500)',
  15: 'var(--color-amber-600)',
  20: 'var(--color-blue-900)',
}

const data = [
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
  { date: '2025-05-10', count: 15 },
  { date: '2025-05-19', count: 10 },
  { date: '2025-05-29', count: 5 },
];
</script>

<template>
  <PActiveGraph :data="data" :colors="colors" start-date="2025-05-01" end-date="2025-05-30" />
</template>
```
