# VirtualList
Virtual list, supporting variable height items.

## Fixed height items

```vue demo
<script setup>
const listData = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  name: `Item ${i}`,
}))
</script>

<template>
  <PVirtualList class="!h-32 w-100" :list-data="listData" data-key="id" :item-size="40">
    <template #default="{ data }">
      <div class="px-4 h-10 py-2">
        {{ data.name }}
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
  <PVirtualList class="!h-32 w-100" :list-data="listData" data-key="key" :item-size="40">
    <template #default="{ data }">
      <div class="px-4 py-2" :style="{ height: `${data.height}px` }">
        {{ data.name }}
      </div>
    </template>
  </PVirtualList>
</template>
```
