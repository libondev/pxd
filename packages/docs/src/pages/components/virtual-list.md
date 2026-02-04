# Virtual List

Loads infinite lists of data, but doesn't really render them.

## Fixed height items

```vue demo
<script setup>
const listData = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
}))
</script>

<template>
  <PVirtualList
    class="!h-32 w-100 max-w-full border border-dashed rounded-lg"
    :list-data="listData"
    data-key="id"
    :item-size="40"
  >
    <template #default="{ item }">
      <div class="px-4 h-10 py-2">
        {{ item.name }}
      </div>
    </template>
  </PVirtualList>
</template>
```

## Dynamic height items

Set an approximate height for each item.

```vue demo
<script setup>
const listData = Array.from({ length: 100 }, (_, i) => ({
  key: i,
  name: `Item ${i}`,
  height: Math.random() * 100 + 40,
}))
</script>

<template>
  <PVirtualList
    class="!h-32 w-100 max-w-full border border-dashed rounded-lg"
    :list-data="listData"
    data-key="key"
    :item-size="40"
  >
    <template #default="{ item }">
      <div class="px-4 py-2" :style="{ height: `${item.height}px` }">
        {{ item.name }}
      </div>
    </template>
  </PVirtualList>
</template>
```
