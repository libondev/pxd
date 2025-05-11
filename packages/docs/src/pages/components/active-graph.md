# ActiveGraph
Show the activity of users, and show different levels of brightness according to the level.

## Default

```vue demo
<script setup>
const today = new Date()

const data = [
  { date: new Date().toISOString().split('T')[0], count: 30 },
  { date: '2025-05-10', count: 8 },
  { date: '2025-05-15', count: 12 },
  { date: '2024-06-02', count: 2 },
  { date: '2024-06-20', count: 7 },
  { date: '2024-07-05', count: 3 },
  { date: '2024-07-20', count: 15 },
];
</script>

<template>
  <PActiveGraph :data="data"></PActiveGraph>
</template>
```
