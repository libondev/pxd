# ActiveGraph
Show the activity of users, and show different levels of brightness according to the level.

## Default

```vue demo
<script setup>
const today = new Date()

const data = [];

data.push({
  date: today.toISOString().split('T')[0],
  count: 20,
})

today.setDate(today.getDate() - 1)
data.push({
  date: today.toISOString().split('T')[0],
  count: 15,
})

today.setDate(today.getDate() - 1)

data.push({
  date: today.toISOString().split('T')[0],
  count: 10,
})

today.setDate(today.getDate() - 1)
data.push({
  date: today.toISOString().split('T')[0],
  count: 5,
})
</script>

<template>
  <PActiveGraph :data="data" />
</template>
```

## Custom Colors and Date

```vue demo
<script setup>
const colors = {
  0: 'var(--gray-alpha-200)',
  5: 'var(--color-red-400)',
  10: 'var(--color-green-500)',
  15: 'var(--color-amber-700)',
  20: 'var(--color-blue-900)',
}

const data = [
  { date: '2025-05-05', count: 0 },
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
