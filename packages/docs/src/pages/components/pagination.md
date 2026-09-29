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

## Props

| Name | Type | Default | Description |
| --- | --- | --- | --- |
| prev | `Page` | - | Previous page link on the left, built from `label` and `href` |
| next | `Page` | - | Next page link on the right, built from `label` and `href` |
