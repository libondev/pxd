# Pagination
Navigate to the previous or next page.

## Default

```vue demo
<script setup>
const prev = {
  label: 'Home',
  href: '#',
}

const next = {
  label: 'Introduction',
  href: '#',
}
</script>

<template>
  <PPagination :prev="prev" :next="next" />
</template>
```
