# ActiveGraph
Show the activity of users, and show different levels of brightness according to the level.

## Default

```vue demo
<script setup>
const today = new Date()

const data = [
  { date: '2025-05-05', count: 0 },
  { date: '2025-05-06', count: 5 },
  { date: '2025-05-07', count: 10 },
  { date: '2025-05-08', count: 15 },
  { date: '2025-05-09', count: 20 },
  { date: '2024-06-02', count: 2 },
  { date: '2024-06-20', count: 7 },
  { date: '2024-07-05', count: 3 },
  { date: '2024-07-20', count: 15 },
];
</script>

<template>
  <PActiveGraph :data="data" start-date="2024-05-13" end-date="2025-05-10" />
</template>
```
