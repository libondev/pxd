# Virtual List

Display unlimited data lists and maintain page performance

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

## Infinite scroll

Use the `status` parameter with the `reach-bottom` / `retry` event to achieve infinite scrolling of data loading

```vue demo
<script setup>
import { ref, onMounted } from 'vue'

const listData = ref([])
const listStatus = ref() // 'loading' | 'finished' | 'error'

async function onReachBottom() {
  const startIdx = listData.value.length

  if (startIdx >= 100) {
    listStatus.value = 'finished'
    return
  }

  listStatus.value = 'loading'

  // mock async request
  await new Promise((resolve, reject) => {
    setTimeout(() => {
      if (Math.random() < 0.25) {
        listStatus.value = 'error'
      }

      resolve()
    }, 800)
  })

  if (listStatus.value === 'error') {
    return
  }

  listData.value.push(
    ...Array.from({ length: 10 }, (_, i) => ({
      id: i,
      name: `Item ${startIdx + i}`,
    }))
  )

  listStatus.value = ''
}

function onRetry() {
  listStatus.value = ''
  onReachBottom()
}

onMounted(() => {
  onReachBottom()
})
</script>

<template>
  <PVirtualList
    class="!h-32 w-100 max-w-full border border-dashed rounded-lg"
    data-key="id"
    :item-size="40"
    :status="listStatus"
    :list-data="listData"
    @retry="onRetry"
    @reach-bottom="onReachBottom"
  >
    <template #default="{ item }">
      <div class="px-4 h-10 py-2">
        {{ item.name }}
      </div>
    </template>
  </PVirtualList>
</template>
```
