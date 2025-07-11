# IntersectionObserver
Render only when components are visible in the viewport.

> Inspiration comes from [isaact/vue-infinity - Github](https://github.dev/isaact/vue-infinity)

## Default
The component supports the `root/root-margin/threshold` attribute, which will be passed directly to IntersectionObserver.

```vue demo
<script setup>
import { shallowRef } from 'vue'

const isVisible = shallowRef(true)

function onVisibleChange(visible) {
  isVisible.value = visible
}

function onBeforeShow() {
  console.log('onBeforeShow')
}

function onShow() {
  console.log('onShow')
}

function onBeforeHide() {
  console.log('onBeforeHide')
}

function onHide() {
  console.log('onHide')
}
</script>

<template>
  <div>
    <span>Content is </span>
    <span class="font-semibold underline" :class="isVisible ? 'text-blue-900' : 'text-red-900'">{{ isVisible ? 'visible' : 'hidden' }}</span>
  </div>

  <div class="w-100 h-60 overflow-auto mt-2 p-4">
    <PIntersectionObserver
      class="w-80 h-40 rounded-md border border-dashed mb-60 mr-100 bg-background-secondary"
      @change="onVisibleChange"
      @before-show="onBeforeShow"
      @show="onShow"
      @before-hide="onBeforeHide"
      @hide="onHide"
     >
      <div>Hello, world!</div>
    </PIntersectionObserver>
  </div>
</template>
```

## Estimated size
Setting an estimated size can prevent large layout deviation after rendering. (After the first rendering, it will be replaced with the real size.)

```vue demo
<script setup>
import { shallowRef } from 'vue'

const isVisible = shallowRef(false)

function onVisibleChange(visible) {
  isVisible.value = visible
}
</script>

<template>
  <div>
    <span>Content is </span>
    <span class="font-semibold underline" :class="isVisible ? 'text-blue-900' : 'text-red-900'">{{ isVisible ? 'visible' : 'hidden' }}</span>
  </div>

  <div class="w-100 h-60 overflow-auto mt-2 p-4">
    <PIntersectionObserver
      class="rounded-md border border-dashed mt-60 bg-background-secondary"
      width="100"
      height="30"
      @change="onVisibleChange"
     >
      <div>Hello, world!</div>
    </PIntersectionObserver>
  </div>
</template>
```
